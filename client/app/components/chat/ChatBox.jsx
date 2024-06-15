import React,{useCallback, useState} from 'react'
import redashpng from "@/assets/images/favicon-96x96.png";
import './chatbox.less'
import Chat from '@/services/chat';
import { IoCopy } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';
//import useQueryExecute from "../../pages/queries/hooks/useQueryExecute";

export default function ChatBox() {
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [chatHistory, setChatHistory] = useState([]);

  const handler = (event) => {
    if (event.keyCode === 13) {      
      handleChatInput();
    }
  };

  function handleChatInput() {
    const data = { sender: "user", text: input };
    if (input !== "") {
      setChatHistory((history) => [...history, data]);
      chatWithOpenai(input);    
      setInput("");  
    }
  }

  async function chatWithOpenai(text) {
    const requestOptions = {
        question: text
    };
    const response = await Chat.openai(requestOptions);
    const data = {
      sender: "bot",
      text: response.answer
    };
     setChatHistory((history) => [...history, data]);
     setInput("");
  }

  // async function postquery() {
  //   const query_data = {
  //       "name": "Testing",
  //       "query": "select * from sales;",
  //       "schedule": {"interval": "3600"},
  //       "data_source_id": "1",
  //   }
  //   const response = await Chat.createquery(query_data)
  //   // console.log("output", response)
  //   executequery(response.id)
  // }

  // async function executequery(qry_id) {
  //   const queryData = {
  //     query: "SELECT * FROM sales",
  //     query_id: qry_id,
  //     max_age: 0, 
  //     data_source_id: "1",
  //     parameters: {}, 
  //     apply_auto_limit: false 
  //   };
  
  //   const response = await Chat.postqryResult(queryData);
  //   let jobId = response.job.id;
  //   let resultId = null;
  //   if (resultId === null) {
  //     try {
  //       await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
  //       const jobResponse = await Chat.getjob(jobId);
  //       resultId = jobResponse.job.result_id;
  //       let res = await Chat.fetchqryResult(resultId)
  //       console.log("query result", res)
  //     } catch(error){
  //       console.log("error", error)
  //     }
  //   } else {}
  
    
  // }

  const handleCopy = (content) => {
    copy(content);
    const updatedCopiedStates = { ...copiedStates };
    updatedCopiedStates[content] = true;
    setCopiedStates(updatedCopiedStates);

    setTimeout(() => {
      const revertedCopiedStates = { ...copiedStates };
      revertedCopiedStates[content] = false;
      setCopiedStates(revertedCopiedStates);
    }, 2000); // Change the duration (in milliseconds) as needed
  };


  const visual = async() => {
    const newVisualizationData = {
      query_id: 4,
      type: "line",
      name: "JIMMY",
      x_axis: "year",
      y_axis: [
        {
        name: "count"
        }
      ]
      };
    const potions = {
      "globalSeriesType": "box",
      "sortX": true,
      "legend": {"enabled": true},
      "yAxis": [{"type": "linear"}, {"type": "linear", "opposite": true}],
      "xAxis": {"type": "category", "labels": {"enabled": true}},
      "error_y": {"type": "data", "visible": true},
      "series": {"stacking": null, "error_y": {"type": "data", "visible": true}},
      "columnMapping": { "year": "x",
        "count": "y"},
      "seriesOptions": {
        count: {
          name: "count",
          type: "box",
          index: 0,
          yAxis: 0,
          zIndex: 0
        }
      },
      "showDataLabels": false
  }
    const visualizationConfig = {
      query_id: 4,
      name: "PIMMY",
      description: "",
      options: potions
    };
    
    const response = await Chat.visualize(visualizationConfig)
    console.log("result", response);
  };
  

  const AnswerParts = (answer) => {
    const parts = [];
    const codeRegex = /```([\s\S]*?)```/g;
  
    let match;
    let lastIndex = 0;
  
    while ((match = codeRegex.exec(answer))) {
      const codeContent = match[1].trim();
  
      if (match.index > lastIndex) {
        const textContent = answer.substring(lastIndex, match.index).trim();
        parts.push({ type: 'text', content: textContent });
      }
            
      const [firstWord, ...rest] = codeContent.split(/\s+/);

      parts.push({ type: 'code', firstWord, content: rest.join(' ') });
  
      lastIndex = match.index + match[0].length;
    }
  
    if (lastIndex < answer.length) {
      const textContent = answer.substring(lastIndex).trim();
      parts.push({ type: 'text', content: textContent });
    }
       
    return parts;
  };
  

  return (
    <>
      {open?
      <div className='chatcontainer'>
        <div>
            <div className='headbox'>
              <p onClick={visual}>query, visualize with AI</p>                   
            </div>
            

            <div className='chatbox'> 
              {chatHistory.map((chat, index) => (
                <div key={index} className="chatcontain">
                  {chat.sender === "user" ? (
                    <div className="user">
                      <div className="">
                        <p className="parauser">{chat?.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className='ai'>
                      <div className="">
                        {chat?.text && (
                          <div>
                            {AnswerParts(chat.text).map((part, partIndex) => (
                              <React.Fragment key={partIndex}>
                                {part.type === 'code' ? (
                                  <div className="">
                                    <div className='chat-head'>
                                        <div className='copy' onClick={() => handleCopy(part.content)}>
                                          {copiedStates[part.content] ? (
                                            <FaCheck className='check'/>
                                          ) : (
                                            <IoCopy className='copyicon'/>
                                          )}
                                        </div>
                                        <div className=''>
                                          {part.firstWord}
                                        </div>                            
                                    </div>
                                    <SyntaxHighlighter
                                      language={part.firstWord}
                                      style={docco}
                                      className='x-container'
                                      customStyle={{
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        maxWidth: '200%',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        overflow: 'auto'
                                      }}
                                    >
                                      {part.content}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <p>{part.content}</p>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className='inputbox'>        
              <input             
                  className="input"    
                  type="text"
                  value={input}
                  placeholder="Type your message…"
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => handler(e)}
              />
            </div>
        </div>
      </div>
      :null}

      <div className='iconbox' onClick={()=>setOpen(!open)}>
         <img alt="charimage" src={redashpng} className="icon" />
      </div>     
    </>
  )
}