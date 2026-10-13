---
title: Load Balancers Work Like Grocery Store Checkout Lines
slug: how-load-balancers-work-like-grocery-store-checkout-lines
date: "2022-06-21T05:40:00.000Z"
updated: "2022-09-14T10:54:46.000Z"
edition: 1
tags: ["load balancer", "load balancing", "Articles", "Technology"]
summary: You’ve been in the grocery store with only one check out line. There’s a manager always watching to see if the lines back up. The manager sees this and next thing you know, there’s 3 […]
status: published
---

You've been in the grocery store with only one check out line.

There's a manager always watching to see if the lines back up. The manager sees this and next thing you know, there's 3 cashiers opening more. Then the line disappears. 

The same thing happens in the business networking world.

![](https://chadunderwood.com/wp-content/uploads/2022/06/grocery-store-line-1024x683.jpg)Photo by [Brittani Burns](<https://unsplash.com/@brittaniburns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>) on [Unsplash](<https://unsplash.com/s/photos/grocery-store?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>)

We call it load balancing and is the responsibility of a load balancer (what an original name). 

In our example above, the cashiers are the servers. The manager is the load balancer. The people in line are the network traffic.

The load balancer watches over the servers and sends traffic to the least used server.

## Load balancing process

Load balancing is the process of splitting network traffic across multiple servers. It helps increase availability for applications and websites for users. It spreads traffic across multiple servers to help applications be more responsive. As data is coming in, the load balancer decides which server has the most resources available 

## What is a load balancer?

A load balancer is a [physical server](<https://chadunderwood.com/servers-simplified/>) or [virtual machine](<https://chadunderwood.com/virtualization-the-school-bus-of-technology/>) connected close to the main connection or outside of the main network. It distributes network traffic in an efficient way.

## How is this possible?

The servers with the application or the data are exact copies of one another. So the traffic is able to be routed to any other server with the necessary data. This happens without the end user ever being aware.

## What are the major benefits?

The first benefit is very little downtime. You can shut down 1 server and every thing would still work. This allows IT departments to update servers as needed without ever having downtime. The only possible way for the application to go down would be a power outage to happen and last a long time. 

## Time of load balancers use

Their use began in the 90s. But were limited to network traffic. Originally, they were hardware appliances (small server doing one purpose). Now they've taken on more duties.

## What are the other duties a load balancer does?

They still do the basic function of splitting networks loads. Now they act as firewalls, scale application services on demand, and consolidate the network services. Also they consolidate other services, they can handle SSL/TLS, caching, compression, intrusion, and firewalls.

## Can load balancers be used with one server?

It's possible to use a load balancer with one server, but wouldn't serve much of a purpose. Since there wouldn't be any where else for the traffic to transfer having a load balancer would be pointless.
