const OCR_PARSE_URL = "https://cibil-ocr-api-production.up.railway.app/parse";

export async function parseCreditReportDocument(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(OCR_PARSE_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}).`);
  }

  return response.json();
}
