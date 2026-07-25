/**
 * PBOS Kernel Logger
 *
 * Provides consistent console output across all PBOS engines.
 */
export class Logger {
  static line(): void {
    console.log("===================================");
  }

  static blank(): void {
    console.log();
  }

  static header(title: string): void {
    this.blank();
    this.line();
    console.log(title);
    this.line();
    this.blank();
  }

  static section(title: string): void {
    console.log(title);
    console.log("-".repeat(title.length));
  }

  static info(message: string): void {
    console.log(message);
  }

  static success(message: string): void {
    console.log(`✓ ${message}`);
  }

  static warning(message: string): void {
    console.log(`⚠ ${message}`);
  }

  static error(message: string): void {
    console.log(`✗ ${message}`);
  }

  static keyValue(label: string, value: unknown): void {
    console.log(`${label.padEnd(20)} ${String(value)}`);
  }
}
