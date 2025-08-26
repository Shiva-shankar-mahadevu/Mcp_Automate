import { KiteConnect } from "kiteconnect";

const apiKey = "zeyklqqdihcmjpha";
// const apiSecret = "xd19lf312m3d7f6w3p1rwrjz1wlnig0d";
// const requestToken = "WwA29JQNp64V1jyWQC2Y8BjusNNbIE61";
let accessToken="wQUs7x3IInbzIiK1R0Otxo9cwKtrSc5p";
const kc = new KiteConnect({ api_key: apiKey });
// console.log(kc.getLoginURL());
// KiteConnect Trading Order Placement Code Analysis



// Main function to place a trading order
export async function placeOrder(tradingsymbol:string ,quantity:number, type : "BUY" | "SELL") {
    try {
        // Set access token for authentication
        kc.setAccessToken(accessToken);
        
        // Place the order with specified parameters
        await kc.placeOrder("regular", {
            exchange: "NSE",           
            tradingsymbol,            
            transaction_type: type,   
            quantity,                
            product: "CNC",          
            order_type: "MARKET"     
        });
        
    } catch (err) {
        console.error(err);
    }
}

