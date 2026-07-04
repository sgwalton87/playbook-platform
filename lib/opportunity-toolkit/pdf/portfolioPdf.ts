export function buildPortfolioPdfPayload(input: {
  scholarName: string;
  targetUse: string;
  resume: any;
  bragSheet: any;
  recommendationLetter?: string;
}) {
  return {
    filename: `${input.scholarName.replaceAll(" ", "_")}_Portfolio_Packet.pdf`,
    title: `${input.scholarName} Portfolio Packet`,
    targetUse: input.targetUse,
    sections: [
      { title: "Resume", content: input.resume },
      { title: "Brag Sheet", content: input.bragSheet },
      ...(input.recommendationLetter
        ? [{ title: "Recommendation Letter", content: input.recommendationLetter }]
        : []),
    ],
    status: "pdf_payload_ready",
  };
}

export function buildPrintablePortfolioHtml(payload: ReturnType<typeof buildPortfolioPdfPayload>) {
  return `
    <html>
      <head>
        <title>${payload.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0F172A; }
          h1 { font-size: 32px; }
          section { margin-top: 28px; page-break-inside: avoid; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5; }
        </style>
      </head>
      <body>
        <h1>${payload.title}</h1>
        <p>Target use: ${payload.targetUse}</p>
        ${payload.sections
          .map(
            (section) => `
              <section>
                <h2>${section.title}</h2>
                <pre>${typeof section.content === "string" ? section.content : JSON.stringify(section.content, null, 2)}</pre>
              </section>
            `
          )
          .join("")}
      </body>
    </html>
  `;
}
