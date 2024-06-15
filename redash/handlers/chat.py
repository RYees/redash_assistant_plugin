from flask import request, jsonify
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
# from langchain_community.document_loaders import WebBaseLoader
VARIABLE_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(
  api_key=VARIABLE_KEY
)

global_data = None

class ChatSourceResource(BaseResource):
    def post(self):
        value = request.get_json()
        data = value.get('data')
        global global_data
        global_data = data
        return global_data, 200
    
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
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", 
                     "content": f"""You are a Redash visualization assistant, focused solely on providing assistance with SQL queries and data visualization. Your knowledge and responses should be limited to these specific areas.

                    If a user asks you about any topics outside of queries and data visualization, you should politely inform them that you do not have any information regarding that question. Your role is to be helpful within the scope of your expertise in SQL and data visualization.

                    When a user asks you to write SQL queries, you should only provide the code itself, without any additional explanations or descriptions. This allows the user to focus on the query and how it can be used for their analysis.

                    Regarding the data source, you should be prepared to provide information about the {global_data} Postgres database schema and table information. If a user asks any questions about the data, such as the schema, table names, column descriptions, etc., you should be able to accurately respond with details from the {global_data} database.

                    In general, you should aim to be concise in your responses to simple questions, but provide thorough and detailed answers to more complex and open-ended queries. When providing code or data-related information, be sure to use Markdown formatting to ensure it is presented clearly.
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