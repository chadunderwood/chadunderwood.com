---
title: SANs Solved the Data Sharing Problem
slug: sans-solved-the-data-sharing-problem
date: "2022-08-02T05:40:00.000Z"
updated: "2022-09-14T10:07:11.000Z"
edition: 1
tags: ["business tech", "SAN", "storage area network", "Articles", "Technology"]
summary: Storage Area Networks (SANs) were created to solve data shares. In the old days, a server would host its own storage. As tech has progressed, application reliability became as issue. When your data and application […]
status: published
---

Storage Area Networks (SANs) were created to solve data shares.

In the old days, a server would host its own storage. As tech has progressed, application reliability became as issue. When your data and application is on one server it becomes a problem fast. IT needed a way for the data to be shared among many servers.

And the Storage Area Network was born.

![Black server racks filled with servers SANs and other data center components. There are network cables dropping into the racks. The rack has a white logo for ima IX on them.](https://chadunderwood.com/wp-content/uploads/2022/08/image.jpeg)Photo by [imgix](<https://unsplash.com/@imgix?utm_source=medium&utm_medium=referral>) on [Unsplash](<https://unsplash.com?utm_source=medium&utm_medium=referral>)

You wouldn’t have one in your house, but you use them every day.

SANs are in data centers. Storage Area network is a server or set of servers connected to provide shared storage. A storage area network can contain thousands of host servers and storage devices.

Every company with an application uses them.

### SANs are a networked storage solution

SANs help companies store data in a central, reliable, and flexible location.

The flexibility for companies comes from being able to add more storage as needed without changing anything already setup. The reliability comes from application servers ability to access the same data no matter when it changes. Since the components are connected the data ends up being centralized.

This is why a SAN is most important part of any company’s network.

### Storage connected together

Devices in a SAN connect to one another via a network.

This network is different from the network in your house allowing you to connect your computers to share files or printers. SANs have their own connections and protocols.

There’s 3 connections used to connect to a SAN

  * **Fibre Channel Protocol (FCP)** — FCP is the most used connection protocol. It uses a Fiber Channel (think fiber optics) connection to send data between all the devices.  
It has speeds up to 16 Gbps (gigabits per second). FC considered more secure than TCP/IP (the type of network you have in your house).
  * **iSCSI (Internet Small Computer Systems Interface)** — iSCSI is a protocol allowing data packets to be delivered on the TCP/IP network. It still offers the same type of storage FCP allows. This allows the data to be sent over the internet.  
iSCSI is becoming more prevalent because network speeds are getting so much faster.
  * **(FCoE) Fibre Channel over Ethernet** — FCoE works by sending the same data packets FCP sends by over ethernet. You need special hardware designed to connect Fiber channel to ethernet.

One connection connects the devices to a SAN switch. The SAN switches connection to one another makes up the network.

This SAN switch connects the SAN to the servers needing access to the data.

### Benefits of SAN

All of the storage devices within a SAN are all connected. This keeps one device from bringing down the whole network.

Since data in a SAN doesn't attach to 1 single server, companies can move applications to different server hosts without worrying about the data.

SANs management happens in one central location. IT staff can encrypt data, backup data, and remove duplicate data from one place.

You can easily replicate (backup) the data to a different SAN without degrading your TCP/IP network

### SANs are great for database storage

A good example for a SAN is database storage.

There’s a ton of information in a database to share with an application. The data needs to be accessible all the time. Since the data is in one place, the application doesn’t have to be.

IT staffs will create multiple virtual machines running the application. All of those virtual machines will be setup to access the SAN. When a [virtual machine goes down, the fail over machine](<https://chadunderwood.com/server-clusters-keep-applications-running-when-failures-happen/>) has access and it can pick up where the problem machine leaves off until it’s fixed.

This makes maintenance of application servers easy.
