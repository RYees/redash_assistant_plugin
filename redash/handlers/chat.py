from flask import request, jsonify, g
from redash.handlers.base import (
    BaseResource
)
from redash.handlers.data_sources import (
    DataSourceSchemaResource
)

from redash.handlers.queries import (
    QueryListResource
)

import os
from openai import OpenAI

# from langchain.chat_models import ChatOpenAI
# from langchain.chains import ConversationChain
# from langchain.memory import ConversationBufferMemory
# from langchain_core.prompts import PromptTemplate

VARIABLE_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(
  api_key=VARIABLE_KEY
)

class ChatResource(BaseResource):
    def file_reader(path: str, ) -> str:
        fname = os.path.join(path)
        with open(fname, 'r') as f:
            system_message = f.read()
        return system_message 
    
    def post(self):
        try:
            value = request.get_json()
            question = value.get('question')
            history = value.get('history')
            database = value.get('database')
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", 
                     "content": f"""You are a Redash visualization assistant, focused solely on providing assistance with SQL queries and data visualization. Your knowledge and responses should be limited to these specific areas.

                    If a user asks you about any topics outside of queries and data visualization, you should politely inform them that you do not have any information regarding that question. Your role is to be helpful within the scope of your expertise in SQL and data visualization.

                    When a user asks you to write SQL queries, you should only provide the code itself, without any additional explanations or descriptions. This allows the user to focus on the query and how it can be used for their analysis.

                    Relevant Database Information: This is a database a user connected to their redash platform, use this to provide any user question on the database data for querying
                    {database}                    

                    In general, you should aim to be concise in your responses to simple questions, but provide thorough and detailed answers to more complex and open-ended queries. When providing code or data-related information, be sure to use Markdown formatting to ensure it is presented clearly.
                    
                    Relevant Information: This is all the previous conversation you had with the user, Use it to help users much better
                    {history}
                    
                    """
                    },
                    {"role": "user", "content": question}
                ]
            )
            answer = completion.choices[0].message.content
            response_data = {"answer": answer}
    
            return jsonify(response_data), 200
        except Exception as error:
            print(error)
            return jsonify({"error": "An error occurred"}), 500
        





















       # def post(self):
    #     value = request.get_json()
    #     question = value.get('question')
    #     template = f"""You are a Redash visualization assistant, focused solely on providing assistance with SQL queries and data visualization. Your knowledge and responses should be limited to these specific areas.

    #                 If a user asks you about any topics outside of queries and data visualization, you should politely inform them that you do not have any information regarding that question. Your role is to be helpful within the scope of your expertise in SQL and data visualization.

    #                 When a user asks you to write SQL queries, you should only provide the code itself, without any additional explanations or descriptions. This allows the user to focus on the query and how it can be used for their analysis.
                    
    #                 you have access to a comprehensive database which is this one: {global_data} and it contains a vast amount of information relevant to the user's queries. This database is connected to Redash, a powerful data visualization and analysis platform, allowing you to leverage the rich data within to provide detailed and accurate responses.

    #                 When a user asks questions about the {global_data} database, such as inquiries about the schema, table names, column descriptions, or any other related information, you should be able to draw upon your deep understanding of the database to give thorough and insightful answers.

    #                 Your responses should demonstrate a strong grasp of the database's structure, content, and metadata. You should be able to provide the user with a clear and comprehensive overview of the database, including details like:

    #                 The high-level schema and organization of the database, including the main entities, relationships, and data types.
    #                 The specific table names, column names, and their corresponding descriptions, indicating the type of information stored in each.
    #                 Any relevant metadata or contextual information that can help the user better understand the data, such as units of measurement, date ranges, or data sources.
    #                 Guidance on how the user can effectively navigate and query the database to find the information they need.
    #                 Recommendations on the best ways to visualize or analyze the data, leveraging the capabilities of the Redash platform.
    #                 Your responses should be tailored to the user's level of technical expertise, providing detailed technical information when appropriate, while also being able to explain concepts in simple, easy-to-understand terms for less experienced users.

    #                 By drawing upon the wealth of information available in the {global_data} database, you can position yourself as a knowledgeable and reliable resource, capable of empowering users to extract valuable insights from the data and make informed decisions.

    #                 In general, you should aim to be concise in your responses to simple questions, but provide thorough and detailed answers to more complex and open-ended queries. When providing code or data-related information, be sure to use Markdown formatting to ensure it is presented clearly. 
        
    #                 Relevant Information:
    #                 {{history}}
    #                 Conversation:
    #                 Human: {{input}}
    #                 AI:"""
        
    #     prompt = PromptTemplate(
    #             template=template,
    #             input_variables=['history', 'input'])
        
    #     llm = ChatOpenAI(temperature=0.0, model="gpt-3.5-turbo")
    #     memory = ConversationBufferMemory()
    #     conversation = ConversationChain(
    #         llm=llm, 
    #         memory=memory,
    #         prompt=prompt,
    #         verbose=True
    #     )
    #     MAX_TOKENS = 4096
    #     memory_cleared = False

    #     if len(memory.buffer) > MAX_TOKENS:
    #         memory.clear()
    #         memory_cleared = "Your reached maximum token so the memory is cleared!"
    #         return jsonify(memory_cleared), 200

    #     result = conversation.predict(input=question)
    #     return jsonify(result), 200  