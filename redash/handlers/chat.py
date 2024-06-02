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

global_data_id = None

class ChatSourceResource(BaseResource):
    def post(self):
        value = request.get_json()
        db_id = value.get('db_id')
        global global_data_id
        global_data_id = db_id

        # Use the QueryListResource endpoint
        query_list_resource = QueryListResource()
        query_list_resource.current_user = self.current_user
        query_list_resource.current_org = self.current_org
        query_data = {
            "data_source_id": db_id,
            "query_text": "select * from sales;",
            "name": "First Query",
            "description": "",
            "schedule": None,
            "options": {},
            "is_draft": True
        }
        response = query_list_resource.post(query_data)

        self.record_event({"action": "create", "object_id": response["id"], "object_type": "query"})

        return response
    
class ChatResource(BaseResource):
    def post(self):
        try:
            value = request.get_json()
            question = value.get('question')
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are a redash visualization assistant, skilled in SQL queries and data visualization. You are only required to give answers for query and data visualization questions. If asked about a topic outside these two, make sure to respond that you have no information regarding that question. I am only here to help you with your query and data visualization questions. When asked to write queries, only provide the code without descriptions. And when asked what is the data source id answer the following the data source id is {global_data_id}"},
                    {"role": "user", "content": question}
                ]
            )
            answer = completion.choices[0].message.content
            response_data = {"answer": answer}
            return jsonify(response_data), 200
        except Exception as error:
            print(error)
            return jsonify({"error": "An error occurred"}), 500