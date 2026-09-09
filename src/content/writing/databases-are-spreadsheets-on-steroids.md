---
title: Databases are spreadsheets on steroids
date: '2022-07-26T05:40:00'
updated: '2022-09-14T10:07:57'
edition: 1
summary: In their simplest form, databases are massive spreadsheets. The information
  stored in a database has logical structure like a spreadsheet. It has headers (columns)
  like a spreadsheet. You can sort, update, and new records to […]
draft: false
example: false
tags:
- business tech
- databases
- Articles
- Technology
featuredImage: https://chadunderwood.com/wp-content/uploads/2022/07/technologic-pic-220726-scaled.jpg
categories:
- Articles
- Technology
sourceUrl: https://chadunderwood.com/databases-are-spreadsheets-on-steroids/
---

In their simplest form, databases are massive spreadsheets.

The information stored in a database has logical structure like a spreadsheet. It has headers (columns) like a spreadsheet. You can sort, update, and new records to the data.

And this is where the similarities end.

![](https://chadunderwood.com/wp-content/uploads/2022/07/technologic-pic-220726-1024x768.jpg)Photo by [Tobias Fischer](<https://unsplash.com/@tofi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>) on [Unsplash](<https://unsplash.com/s/photos/database?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>)

Databases store data amounts a spreadsheet couldn't handle.

They allow many people to access the same data at the same time which isn't possible with a spreadsheet.

## Accessing the data

Special commands access to the data, since there isn't a user interface.

These special commands pull the relevant data like you would filters in Excel. SQL (structured query language) is the most common language for DBMS. SQL is a set of commands to access data stored in a database.

But there are other flavors from companies like Oracle.

## Location of the database

Databases [run on their own server](<https://chadunderwood.com/servers-simplified/>).

This server is separate from the apps they’re serving information to. Users or programmers need to login to the database management system (DBMS) to pull the data they need. Once they're in the DBMS, they run specific commands to get the data they are looking.

A programmer would add the data to their app and the user see the data in the application.

## Examples of databases in use

[Twitter](<https://www.twitter.com/chadunderwood>) uses databases to store all the information about tweets.

The Twitter database contains the tweet content, the time of the post, and the engagement metrics. They use different views of the same data to present the information in different places. For example, the Twitter analytics shown in a tweet uses the same database as the information shown in the analytics page.

Same thing with Google.

Searching on Google shows the information from their database. They crawl the internet to find relevant results when you go there. Instead, they're querying their stored data to find the information. They update their databases with information as it changes multiple times per day.

## 3rd party access

APIs allow 2 different companies/people to share data but limit the data accessed.

[APIs give secure access to a data](<https://chadunderwood.com/apis-make-apps-like-a-restaurant/>). The company with the information creates an API. Once created they give the 3rd party company instructions on accessing their data. Then the 3rd party uses these instructions to add specific code use the data in their (3rd party) application.

This is how a Twitter app not made by Twitter works.
