import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64, imageUrl } = await req.json();
  let imageToProcess = imageBase64;

  if (!imageToProcess && imageUrl) {
    // Fetch image from URL and convert to base64
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    imageToProcess = Buffer.from(arrayBuffer).toString("base64");
    imageToProcess = `data:image/jpeg;base64,${imageToProcess}`;
  }
  if (!imageToProcess) {
    return NextResponse.json({error: "No image provided" }, { status: 400 });
  }
  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google Cloud Vision API key not set" }, { status: 500 });
    }
    // Remove data URL prefix if present
    const base64 = imageToProcess.replace(/^data:image\/\w+;base64,/, "");
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "TEXT_DETECTION" }],
            },
          ],
        }),
      }
    );
    const data = await response.json();
    console.log('Vision API raw response:', JSON.stringify(data, null, 2)); // Log the full response for debugging
    if (data.error) {
      return NextResponse.json({ error: `Vision API error: ${data.error.message || 'Unknown error'}` }, { status: 500 });
    }
    const text = data.responses?.[0]?.fullTextAnnotation?.text || "";
    if (!text) {
      return NextResponse.json({ error: "No text detected in image. Please check your image quality, API key, and quota." }, { status: 400 });
    }
    // 1. Amount: Extract the most frequent number < 1000 from all 'Total' lines
    let amount = null;
    const totalLines = text.split('\n').filter((line: string) => /total/i.test(line));
    const summaryEndIndex = text.toLowerCase().indexOf('authorized signatory');
    const totalAmounts: number[] = [];
    for (const line of totalLines) {
      // Only consider lines before the summary table ends
      const lineIndex = text.indexOf(line);
      if (summaryEndIndex !== -1 && lineIndex > summaryEndIndex) continue;
      const matches = Array.from(line.matchAll(/([0-9]+[.,][0-9]{2})/g)) as RegExpMatchArray[];
      for (const m of matches) {
        const val = parseFloat(m[1].replace(/,/g, ''));
        if (!isNaN(val) && val < 1000) totalAmounts.push(val);
      }
    }
    if (totalAmounts.length) {
      // Count frequency of each amount
      const freq: Record<string, number> = {};
      totalAmounts.forEach(a => { freq[a] = (freq[a] || 0) + 1; });
      // Find the amount with the highest frequency
      const maxFreq = Math.max(...Object.values(freq));
      const mostCommon = Object.keys(freq).filter(a => freq[a] === maxFreq).map(Number);
      // If tie, pick the last occurrence in totalAmounts
      for (let i = totalAmounts.length - 1; i >= 0; i--) {
        if (mostCommon.includes(totalAmounts[i])) {
          amount = totalAmounts[i];
          break;
        }
      }
    }
    // If not found, fallback to the largest number with a decimal less than 1000 in the whole text
    if (!amount) {
      const matches = Array.from(text.matchAll(/([0-9]+[.,][0-9]{2})/g)) as RegExpMatchArray[];
      const allAmounts = matches
        .map((m) => parseFloat(m[1].replace(/,/g, '')))
        .filter((n) => !isNaN(n) && n < 1000);
      amount = allAmounts.length ? Math.max(...allAmounts) : null;
    }
    // 2. Date: Look for 'Date:'
    let date = null;
    const dateLine = text.split('\n').find((line: string) => /date:/i.test(line));
    if (dateLine) {
      const match = dateLine.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/);
      if (match) date = match[1];
    }
    if (!date) {
      const dateMatch = text.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/) || text.match(/\b(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/);
      date = dateMatch ? dateMatch[1] : null;
    }
    // Normalize date to YYYY-MM-DD if possible
    if (date) {
      const parts = date.split(/[\/\-.]/);
      if (parts[2]?.length === 4) {
        // DD/MM/YYYY or MM/DD/YYYY
        date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (parts[0]?.length === 4) {
        // YYYY/MM/DD
        date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
    // 3. Vendor: Look for 'SITA ATTA CHAKKI' in the text
    let vendor = '';
    const vendorMatch = text.match(/SITA ATTA CHAKKI/i);
    if (vendorMatch) {
      vendor = 'SITA ATTA CHAKKI';
    } else {
      // Fallback: use the first non-empty line
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
      vendor = lines.length ? lines[0] : "Unknown Vendor";
    }
    // 4. Category: Use item keywords, fallback to 'Misc'
    let category = "Misc";
    if (/wheat|aata|atta|flour|rice|dal|grain/i.test(text)) category = "Food";
    else if (/travel|bus|taxi|uber|ola|train|flight|air/i.test(text)) category = "Travel";
    else if (/stationery|book|pen|notebook|copy/i.test(text)) category = "Stationery";
    else if (/subscription|netflix|prime|spotify|membership/i.test(text)) category = "Subscription";
    else if (/gift|present|donation/i.test(text)) category = "Gift";
    // 5. Source: keyword matching, fallback to 'Unknown'
    let source = "Unknown";
    if (/upi|gpay|paytm|phonepe/i.test(text)) source = "UPI";
    else if (/card|credit|debit/i.test(text)) source = "Card";
    else if (/cash/i.test(text)) source = "Cash";
    return NextResponse.json({
      text,
      amount,
      date,
      vendor,
      category,
      source,
    });
  } catch (err) {
    return NextResponse.json({ error: "OCR failed", details: String(err) }, { status: 500 });
  }
}
 