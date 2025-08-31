import { get } from "node:http";

export async function fetchContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    get(url, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}
