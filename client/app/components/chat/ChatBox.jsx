import React,{useContext, useState, useEffect} from 'react'
import redashpng from "@/assets/images/favicon-96x96.png";
import './chatbox.less'
import Chat from '@/services/chat';
import { IoCopy } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';
import { Schema } from '../proptypes';

export default function ChatBox() {
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [dataToModel, setDataToModel] = useState({});
  const [dataSourceId, setDataSourceId] = useState();
  const [answeredParts, setAnsweredParts] = useState([]);
  const [schemas, setSchema] = useState([]);

  useEffect(() => {
    const DataSourceId = JSON.parse(localStorage.getItem("DataSourceId"));
    const schemas = JSON.parse(localStorage.getItem("schemas"));
    if (DataSourceId !== null) {
      setDataSourceId(DataSourceId);
    } else {}

    if (schemas !== null) {
      setSchema(schemas["schema"]);
    } else {}

  }, []);
  console.log("dont", schemas)
    
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
        question: text,
        history: chatHistory,
        database: dataToModel
      };

      const response = await Chat.openai(requestOptions); 
      const parts = AnswerParts(response.answer);
      
      const data = {
        sender: "bot",
        parts
      };
      setChatHistory((history) => [...history, data]);
      setInput("");   
      
      const codePartExists = parts.some((part) => part.type === 'code');
      if (codePartExists) {
        const codeParts = parts.filter((part) => part.type === 'code');
        const codeContent = codeParts.map((part) => part.content).join('\n');
        postquery(null, codeContent);
      }         
  }

  const handleCopy = (content) => {
    copy(content);
    const updatedCopiedStates = { ...copiedStates };
    updatedCopiedStates[content] = true;
    setCopiedStates(updatedCopiedStates);

    setTimeout(() => {
      const revertedCopiedStates = { ...copiedStates };
      revertedCopiedStates[content] = false;
      setCopiedStates(revertedCopiedStates);
    }, 2000); // Change the duration (in milliseconds) as needed write an sql query for displaying the sales table?
  };

  
  const AnswerParts = (answer) => {   
    const parts = [];
    const codeRegex = /```([\s\S]*?)```/g;  
    let match;
    let lastIndex = 0;
    let querySyntax = '';
  
    while ((match = codeRegex.exec(answer))) {
      const codeContent = match[1].trim();
  
      if (match.index > lastIndex) {
        const textContent = answer.substring(lastIndex, match.index).trim();
        parts.push({ type: 'text', content: textContent });
      }
  
      const [firstWord, ...rest] = codeContent.split(/\s+/);
      querySyntax = rest.join(' ');
     
      parts.push({ type: 'code', firstWord, content: rest.join(' ') }); 
      lastIndex = match.index + match[0].length;
    }
 
    querySyntax = ''
    if (lastIndex < answer.length) {
      const textContent = answer.substring(lastIndex).trim();
      parts.push({ type: 'text', content: textContent });
    }
    
    return parts;
  };
  
  const postquery = async(name = null, querySyntax = null) => {
    let query_data = {
        "name": `Chat Query`,
        "query": null,
        "schedule": {"interval": "3600"},
        "data_source_id": dataSourceId,
        "visualizations": {}
    }
    console.log("postquery", query_data)
    if (querySyntax !== null) {
        query_data.query = querySyntax;
    } else if (name !== null) {
        query_data.query = `select * from ${name}`;
    } else {
        // Both name and querySyntax are null, throw an error
        throw new Error("Either schema name or querySyntax must be provided.");
    }

    const response = await Chat.createquery(query_data);

    if (querySyntax !== null) {
        await executequery(response.id, querySyntax);
        await visual(response.id);
    } else if (name !== null) {
        await executequery(response.id, query_data.query);
    }

    return response;
  }
  
  // const postquery = async(name=null, querySyntax= null) => {
  //   const query_data = {
  //       "name": `Chat Query`,
  //       "query": `select * from ${name}` || querySyntax.toString(),
  //       "schedule": {"interval": "3600"},
  //       "data_source_id": dataSourceId,
  //       "visualizations": {}
  //   }
  
  //   const response = await Chat.createquery(query_data)
  //   executequery(response.id, querySyntax)
  //   visual(response.id)
  // }

  const executequery = async(qry_id, querySyntax) => {
    const queryData = {
      query: querySyntax,
      query_id: qry_id,
      max_age: 0, 
      data_source_id: dataSourceId,
      parameters: {}, 
      apply_auto_limit: false 
    };
    const response = await Chat.postqryResult(queryData);
    let jobId = response.job.id;
    let resultId = null;
    if (resultId === null) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        const jobResponse = await Chat.getjob(jobId);
        resultId = jobResponse.job.result_id;
        let result = await Chat.fetchqryResult(resultId)
        setDataToModel(result)
      } catch(error){}
    } else {} 
  }

  const visual = async(qry_id) => {
    const _type = "area"
    const potions = {
      "globalSeriesType": _type,
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
          type: _type,
          index: 0,
          yAxis: 0,
          zIndex: 0
        }
      },
      "showDataLabels": false
  }
    const visualizationConfig = {
      type: "CHART",
      query_id: qry_id,
      name: "TestVis",
      description: "",
      options: potions
    };
    
    const response = await Chat.visualize(visualizationConfig)
  };
  
  return (
    <>
      {open?
      <div className='main-box'>
        {show?
        <div className='schema-box'>
          {schemas?.map((schema, index) => (
              <div key={index} className="schema">
                  <button className="schema-btn" onClick={()=>postquery(schema.name)}>{schema.name}</button>              
              </div>
          ))}
        </div>:null}

        <div className='three_lines' onClick={()=>setShow(!show)}>
          <div className='lines'></div>
          <div className='lines'></div>
          <div className='lines'></div>
        </div>

        <div className='chatcontainer'>
          <div>
              <div className='chatbox'>
                <div className='head_full'>
                  <div className='headbox'>
                    <p>query, visualize with AI</p>                   
                  </div>
                </div>

                {chatHistory?.map((message, index) => (
                  <div key={index} className={`chatcontain ${message.sender}`}>
                    {message.sender === "user" ? (
                      <div className="user">
                      <div className="">
                        <p className="parauser">{message.text}</p>
                      </div>
                    </div>
                    ):(
                    <div className='ai'>
                      {message.sender === "bot" && (
                        <>
                          {message.parts.map((part, partIndex) => (
                            <div key={partIndex}>                          
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
                              ):(
                                <p>{part.content}</p>
                              )}
                            </div>
                          ))}
                        </>
                      )}
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
      </div>
      :null}

      <div className='iconbox' onClick={()=>setOpen(!open)}>
         <img alt="charimage" src={redashpng} className="icon" />
      </div>     
    </>
  )
}