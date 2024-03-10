// eslint-disable-next-line no-unused-vars

const codeRegex = /```(.*)(\r\n|\r|\n)(?<code>[\w\W\n]+)(\r\n|\r|\n)```/;

export function preprocessJsonInput(text: string) {
  try {
    return text.match(codeRegex)?.groups?.code.trim();
  } catch (e) {
    throw new Error("No code found");
  }
}
