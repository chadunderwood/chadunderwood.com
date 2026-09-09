---
title: 3 things you should know about load balancers
date: '2022-06-23T06:00:00'
updated: '2022-09-14T10:05:47'
edition: 1
summary: 99.9% uptime for a website/app is a necessity. There’s a silent hero for
  making this possible. Here’s the 3 things you should know about load balancers.
  Real World Comparison You’ve been in a grocery store […]
draft: false
example: false
tags:
- load balancers
- Short Essays
categories:
- Short Essays
sourceUrl: https://chadunderwood.com/3-things-you-should-know-about-load-balancers/
---

99.9% uptime for a website/app is a necessity.   
There's a silent hero for making this possible.   
Here's the 3 things you should know about load balancers.

**Real World Comparison**  
You've been in a grocery store with 1 open register.   
There's a manager watching to see if the line backs up.   
The manager sees it and sends cashiers to open more.   
Then the line is gone.   
The same thing happens in the business networking world.

**Load Balancing**  
What the manager is doing is called load balancing. On a network, there's a server installed called a load balancer. This load balancer does the same thing as the manager. It sends the traffic to an unused server.

**How it works**  
When the app/website server is created it is duplicated.   
The load balancer is told which servers are associated with the app.  
Traffic flows to the load balancer, it checks to see which server is most used.  
It sends the traffic to the least used server.

**The setup**  
There has to be at least 2 identical app/website servers. After 2 servers, you can add more to handle the traffic.

This is how you get websites with 99.9% uptime.  
You may hear this called resiliency.  
And it's been around since the 90s.

https://twitter.com/chadunderwood/status/1539231695580409856
