export const C = {
  paper: "#F8F5EE", canvas: "#F1EDE4", card: "#FFFDFA", ink: "#292A25",
  muted: "#858477", line: "#E6E0D5", sage: "#778873", sageLight: "#E5EADF",
  terra: "#C47E69", terraLight: "#F2E5DF", butter: "#E9D9AE", dark: "#252821",
};
export const serif = "Georgia";
export const money = (n:number) => "₱" + Number(n || 0).toLocaleString("en-PH",{maximumFractionDigits:0});
