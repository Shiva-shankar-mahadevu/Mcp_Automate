import { sendEmail } from "./send.ts";

(async () => {
  // Example usage
  await sendEmail({
    from: "pp7007144435@gmail.com",
    to: ["2022ugcs095@nitjsr.ac.in"],
    subject: "checking gmail sent api",
    text: "hai praven ",
    
    attachments: [
      // { path: "./files/demo.pdf", filename: "demo.pdf" }
    ],
  });
})();
