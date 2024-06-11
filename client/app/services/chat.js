import { axios } from "@/services/axios";
   
const Chat = {
  openai: data => axios.post('api/chat', data),
  csource: data => axios.post('api/chatsource', data),
  createquery: data => axios.post('api/queries', data),
  resultById: data => axios.get(`api/queries/${data}/results.json`),
  fetchqryResult: data => axios.get(`/api/query_results/${data}`),
  postqryResult: data => axios.post('/api/query_results', data),
  getjob: data => axios.get(`/api/jobs/${data}`),
  getquery: data => axios.get(`/api/queries/${data}/results`)
};

export default Chat;


// def get_query_by_id(self, query_id, filetype='json'):        
//   # Construct the API endpoint URL based on the provided parameters
//   url = f"queries/{query_id}/results.{filetype}"

//   # Make the API request and handle the response
//   response = self.get(url)
//   response.raise_for_status()

//   return response.json()