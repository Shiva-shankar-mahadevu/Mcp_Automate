import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { sendEmail } from "./send.ts";
import { placeOrder } from "./trade.ts";
// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0"
});

// Add an addition tool
server.registerTool("add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() }
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

server.registerTool("factorial",{
  title: "Factorial Tool",
  description: "Calculate the factorial of a number",
  inputSchema: { n: z.number().int().nonnegative() }
}, async ({ n }) => { 
  let result=1;
  for (let i = 3; i <= n; i++) {
    result *= i;
  }
  return {
    content: [{ type: "text", text: String(result) }]
  };
})



server.registerTool("buy-a-stock",
  {
    title: "Stock buying tool",
    description: "tool to buy a stock from brokerage",
    inputSchema: { stock: z.string(), qty: z.number() }
  },
  async ({ stock, qty }) => {
    await placeOrder(stock, qty, "BUY");
    return {
      content: [{ type: "text", text:`Order placed to buy ${qty} shares of ${stock}` }]
    };
  }
);


server.registerTool("sell-a-stock",
  {
    title: "Stock selling tool",
    description: "tool to sell a stock from brokerage",
    inputSchema: { stock: z.string(), qty: z.number() }
  },
  async ({ stock, qty }) => {
    await placeOrder(stock, qty, "SELL");
    return {
      content: [{ type: "text", text: `Order placed to sell ${qty} shares of ${stock}` }]
    };
  }
);

 server.registerTool(
    "send_email",
    {
      title: "Send Email (Gmail API)",
      description:
        "Send an email via Gmail API using the locally authorized account. 'from' must be the authorized Gmail or a verified alias.",
      inputSchema: {
        
        to: z.union([z.string().email(), z.array(z.string().email()).nonempty()]),
        subject: z.string(),
        text: z.string().optional(),
        html: z.string().optional(),
        attachments: z
          .array(
            z.object({
              path: z.string(),
              filename: z.string().optional(),
              contentType: z.string().optional(),
            }),
          )
          .optional(),
      },
    },
    async ({  to, subject, text, html, attachments }) => {
      if (!text && !html) throw new Error("Provide either 'text' or 'html'.");
      const toList = Array.isArray(to) ? to : [to];

      const res = await sendEmail({
        from: "pp7007144435@gmail.com",
        to: toList,
        subject,
        text,
        html,
        attachments,
      });

      return {
        content: [
          {
            type: "text",
            text: `Email sent. Gmail id: ${res.id ?? "unknown"}`,
          },
        ],
      };
    },
  );




// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);