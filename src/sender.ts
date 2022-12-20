import { PhoneNumber } from "libphonenumber-js"
import { start } from "repl"
import {create, Whatsapp, Message, SocketState} from "venom-bot"
import parsePhoneNumber, {isValidPhoneNumber} from "libphonenumber-js"

export type QRCode ={
    base64Qr: string
    attempts: number
    }

class Sender{
    private client: Whatsapp
    private connected: boolean
    private qr: QRCode

    get isConnected(): boolean {
        return this.connected
    }

    get qrCode(): QRCode {
        return this.qr
    }

    constructor(){
        this.initialize()
    }

    async sendText(to: string, body: string){
       
       if (!isValidPhoneNumber(to,"BR")){
            throw new Error("Este numero é Inválido")
       }  

       let phoneNumber = parsePhoneNumber(to,"BR")?.format("E.164").replace("+","") as string

       
       phoneNumber = phoneNumber.includes("@c.us") 
           ? phoneNumber 
           : `${phoneNumber}@c.us`
        
        console.log("phoneNumber", phoneNumber)
       
       await this.client.sendText(phoneNumber, body)
       .then((result) => {
            console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
        });
    }
    private initialize(){

        const qr = (base64Qr: string, asciiQr: string, attempts: number)=>{
            this.qr = {base64Qr, attempts}
        }

        const status = (statusSession: string) => {
            this.connected = ["isLogged", "qrReadSuccess", "chatsAvailable "].includes(
                statusSession
            )
        }

        const start = (client: Whatsapp) => {
            this.client = client

            client.onStateChange((state) =>{
                this.connected = state === SocketState.CONNECTED
            })
        }

        create("wpp-sender", qr, status)
        .then((client) => start(client))
         .catch(error => { throw error})
    }
}export default Sender;
