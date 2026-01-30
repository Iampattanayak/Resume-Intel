import * as pdfjsLib from 'pdfjs-dist';

// Configures the worker source.
// This is critical for pdfjs to work in a Vite/React environment without manual file copying.
// We use the unpkg CDN for the worker to avoid complex build configuration for now.
// In a full production app, we might bundle the worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extracts raw text from a PDF file object.
 */
export async function extractPdfText(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // Load the document
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;

        let fullText = '';

        // Iterate over all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Extract strings from text items
            // 'items' contains an array of objects with 'str' property
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += pageText + '\n\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Failed to parse PDF document.');
    }
}

/**
 * Sanitizes raw extracted text to optimize for LLM token usage.
 * - Removes excessive whitespace/newlines
 * - Removes non-printable characters
 * - Normalizes data
 */
export function sanitizeText(text: string): string {
    if (!text) return '';

    return text
        // Replace multiple newlines with a single newline (or two for paragraphs)
        .replace(/\n\s*\n/g, '\n\n')
        // Replace multiple spaces with a single space
        .replace(/[ \t]+/g, ' ')
        // Remove control characters (non-printable), keeping newlines
        .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '')
        // Trim edges
        .trim();
}
