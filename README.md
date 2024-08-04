# Redash Assistant Addon
This project aimed to develop an AI-powered assistant chatbot addon for Redash, a renowned data visualization tool. The primary goal was to enable users to interact with the platform seamlessly using natural language. The AI-generated assistant leverages OpenAI models to help users create SQL queries on their desired data sources using conversational inputs. Additionally, the assistant provides users the option to select appropriate visualization chart types, allowing them to generate visualizations directly within the Redash platform. This integration streamlines the data exploration and reporting process, empowering users to gain insights more efficiently.


# Table of content
* [Overview](#overview)
* [Usage](#usage)
* [Installation](#installation)

## Overview
The AI-powered assistant chatbot addon for Redash is a innovative solution that enhances the user experience of the popular data visualization tool. Leveraging advanced language models from OpenAI, the assistant enables users to interact with Redash using natural language, significantly simplifying the process of creating SQL queries and generating visualizations.

![Watch the video]
(https://www.canva.com/design/DAGJoKgp9NE/VAls9Z3MaLivchVtWCG6NA/edit)

## Usage
To utilize the AI assistant, users can access the chatbot addon directly within the Redash platform. The assistant can understand a wide range of conversational inputs, allowing users to describe the data they want to analyze and the type of visualization they prefer.

Upon receiving a user's request, the assistant will:

* Automatically generate the corresponding SQL query based on the user's natural language input.
* Provide users the option to select an appropriate visualization chart type for the generated query.
* Seamlessly integrate the SQL query and visualization within the Redash platform, enabling users to explore their data and generate reports with ease.
* The AI assistant's intuitive interface and natural language understanding capabilities eliminate the need for users to have extensive SQL or data visualization expertise, making Redash accessible to a broader audience. This integration empowers users to gain insights from their data more efficiently, streamlining the decision-making process.

## Installation
Steps to do run the project:
* First you need to have a working redash on your machine, you can follow these [link](https://github.com/getredash/redash/wiki/Local-development-setup)
* Follow the below steps
``` 
   git clone https://github.com/RYees/redash_assistant_plugin.git
```
   cd redash_assistant_plugin
   
```      
   poetry add
```
```
   yarn add
```
```
   yarn
```
```
   make build
```
```
   make compose-build
```
```
   make up
```
