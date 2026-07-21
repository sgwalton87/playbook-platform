export async function evaluateRepository(report) {
  const passed =
    report.lint.passed &&
    report.typescript.passed &&
    report.build.passed;

  return {
    passed,
    regression: {
      lintErrors: 0,
      lintWarnings: 0
    }
  };
}
