---
title: APIs make apps like a restaurant
slug: apis-make-apps-like-a-restaurant
date: "2022-04-19T22:13:48.000Z"
updated: "2022-09-23T14:23:54.000Z"
edition: 1
tags: ["api", "consumer tech", "Articles", "Technology"]
summary: Simplified explanation of APIs You walk into a restaurant and the hostess takes you to a seat. The waiter walks up and hands you a menu. You browse the menu looking over the available choices. […]
status: published
---

## Simplified explanation of APIs

You walk into a restaurant and the hostess takes you to a seat.

The waiter walks up and hands you a menu. You browse the menu looking over the available choices. You decide what you want and tell the server your choices.

The waiter sends the order to the kitchen. The kitchen completes your order and sends the food back the same as your order.

In a perfect world, this is how you order food in a restaurant but it’s parallel to the way an API (application programming interface) works.

![](https://chadunderwood.com/wp-content/uploads/2022/05/image-5-1024x576.jpeg)

In this scenario, you’re the application. The application has a menu (API) of items it can order from a service (kitchen). The order you placed with the waiter is the API call to the service. The service sends back a response with data (the food). The application then processes (eats) the data. 

APIs use happens all over the internet.

**APIs are the glue connecting different applications together.**

Now let’s answer some of the questions you may still have.

## What is an API?

API, standing for application programming interface, is a set of definitions and protocols to build and integrate applications.

## What is an API call?

An API call is a request sent to the server containing the information for the web application.

## Are there different APIs?

Yes, there are 4 types of APIs.

They receive classification by the access given to the app developers.

**Public APIs** are available to anyone to use.

**Partner APIs** are available to companies who partner with the owner of the company providing the API.

**Private APIs** are only available to apps built within a company. This allows data sharing between different organizations inside a company.

**Composite APIs** are multiple API calls in one request to the server and then receiving one response.

## Are there different protocols?

Yes, there are different protocols also called architectures.

### **REST** (representational state transfer)

The REST architecture is the most popular approach to building APIs.

REST uses a client (app) / [server](<https://chadunderwood.com/servers-simplified/>) approach to separate the front end (what you see on the screen) and the back end (the processes and data happening out of view). REST doesn’t store data or statuses on requests. It does support caching (storing data for future use) when a response is slow.

### **RPC** (remote procedural call)

RPC protocol is a simple means to send and receive data sets. These APIs invoke executable actions or processes. It can use JSON (JavaScript Object Notation) or XML (Extensible Markup Language) for coding. These APIs are JSON-RPC (for JSON) and XML-RPC (for RPC).

### **SOAP** (simple object access protocol)

SOAP is a standard given by the World Wide Web Consortium. It’s widely used to create web APIs. SOAP mainly uses XML. SOAP supports communication protocols like HTTP, SMTP, and TCP.

It doesn’t have a specific style. This allows the developer to write the APIs in different ways making adding features easy. However, SOAP is defined started.

## What does JSON look like?

An API call could pull any of the data below from an API. Not all of the data has to be used by the developer. Some useful data could title, acronym, abbrev, glossdef.
[code] 
    {
        "glossary": {
            "title": "example glossary",
    	"GlossDiv": {
            "title": "S",
            "GlossList": {
            "GlossEntry": {"ID": "SGML",
    		       "SortAs": "SGML",
    	      "GlossTerm": "Standard Generalized Markup Language",
    	      "Acronym": "SGML",
    	      "Abbrev": "ISO 8879:1986",
    	      "GlossDef": {"para": "A meta-markup language, used to create markup languages such as DocBook.", "GlossSeeAlso": ["GML", "XML"]
                        },
    	"GlossSee": "markup"
                    }
                }
            }
        }
    }
    
[/code]

## What does XML look like?

This is the same data as above just in XML.
[code] 
    <!DOCTYPE glossary PUBLIC "-//OASIS//DTD DocBook V3.1//EN">
     <glossary><title>example glossary</title>
      <GlossDiv><title>S</title>
       <GlossList>
        <GlossEntry ID="SGML" SortAs="SGML">
         <GlossTerm>Standard Generalized Markup Language</GlossTerm>
         <Acronym>SGML</Acronym>
         <Abbrev>ISO 8879:1986</Abbrev>
         <GlossDef>
          <para>A meta-markup language, used to create markup
    languages such as DocBook.</para>
          <GlossSeeAlso OtherTerm="GML">
          <GlossSeeAlso OtherTerm="XML">
         </GlossDef>
         <GlossSee OtherTerm="markup">
        </GlossEntry>
       </GlossList>
      </GlossDiv>
     </glossary>
    
[/code]

## How does an application process the data?

The developer is able to see everything the API is offering before they write their code.

The app requests specific data from the API using their code. This is the API request. The API responds with the data in a specific format.

The developer uses the data sent back and sets it to show in specific spots in their app.

## What are some things using API calls?

A good example of an API is sports scores for gambling or fantasy football.

There are only a few places to get sports data in real-time. So these football apps pay for the right to use the data of the provider. Using an API, the football app developer pulls the data and imports the data into their app.
