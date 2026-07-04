export const responsiveBreakpoints = {
  mobile: 640,
  tablet: 900,
  desktop: 1180,
};

export function getResponsiveGrid(min = 280) {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`,
    gap: 16,
  } as React.CSSProperties;
}

export function getResponsiveShell() {
  return {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
  } as React.CSSProperties;
}

export function getMobileStackStyle() {
  return {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  } as React.CSSProperties;
}
