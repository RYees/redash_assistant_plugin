import { axios } from "@/services/axios";
   
const Chat = {
  openai: data => axios.post('api/chat', data),
  csource: data => axios.post('api/chatsource', data)
};

export default Chat;