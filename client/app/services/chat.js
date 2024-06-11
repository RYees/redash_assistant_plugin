import { axios } from "@/services/axios";
   
const Chat = {
  openai: data => axios.post('api/chat', data),
  DataToGpt: data => axios.post('api/data_to_gpt', data),
  createquery: data => axios.post('api/queries', data),
  resultById: data => axios.get(`api/queries/${data}/results.json`),
  fetchqryResult: data => axios.get(`/api/query_results/${data}`),
  postqryResult: data => axios.post('/api/query_results', data),
  getjob: data => axios.get(`/api/jobs/${data}`),
  getquery: data => axios.get(`/api/queries/${data}/results`),
  fetchSchema: data => axios.get(`api/data_sources/${data}/schema`)
};

export default Chat;


