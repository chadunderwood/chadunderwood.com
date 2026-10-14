---
title: Server Clusters Keep Applications Running When Failures Happen
slug: server-clusters-keep-applications-running-when-failures-happen
date: "2022-07-05T05:40:00.000Z"
updated: "2022-08-30T08:07:06.000Z"
edition: 1
tags: ["business tech", "server cluster", "servers", "Articles", "Technology"]
summary: Server clusters keep applications running by allowing one server to switch to another server when it fails. Applications need to be available all the time. There’s many ways to accomplish high availability. We discussed load […]
status: published
---

Server clusters keep applications running by allowing one server to switch to another [server](<https://chadunderwood.com/servers-simplified>) when it fails.

Applications need to be available all the time. There’s many ways to accomplish high availability. We discussed [load balancing and how a load balancer](<https://chadunderwood.com/how-load-balancers-work-like-grocery-store-checkout-lines/>) allows you to split the workload across other servers.

Clusters help with availability, but they don’t work at the same time like a load balancer does.

![](https://chadunderwood.com/wp-content/uploads/2022/07/technologic-22-0705-network-switch-and-cable-picture-1024x683.jpg)

A server cluster is a group of 1 or more servers setup with a backup in case of failure.

When the main node (the name for an individual server in a cluster) fails, the 2nd server takes over the workload. This ensures an application is reliable, scalable, always available.

The switching of workload happens automatically without human intervention.

## Failures a server cluster prevents

Here's the 3 types of possible failures:

**Application/Service failures** \- The application has an error and stops working. 

**Hardware/System failures** \- A part inside of the server fails.

**Site Failures** \- The whole site where the physical server is located goes offline.

Since clusters in simple terms are an automated back-up system the next node takes over as if nothing ever happened.

## 3 types of server clusters

**Single Quorum Cluster** \- Most common server cluster used. Also called a Standard Quorum Cluster. This type of cluster shares a disk array (disk arrays are physical hardware with a bunch of hard drives to store data) for data storage. One server is responsible for managing the disk arrays.

**Majority Node Set Cluster** \- This type of server cluster is used in configurations where the servers are not in the same location. Each node in the cluster manages its own storage. In this scenario you could have one node in your data center. Then your second node at another at location with a 3rd node in [the cloud](<https://chadunderwood.com/yo-whats-the-cloud/>).

**Single Node Cluster** \- This type of cluster contains one server. This is meant for testing. It is seen for research and development.

## Configuration

Clusters can be physical machines in a data center, in the cloud, or even virtualized using [virtual machines](<https://chadunderwood.com/virtualization-the-school-bus-of-technology/>).

Each node is configured the same way as the other servers. Each node has its own [processor, RAM, and hard drive](<https://chadunderwood.com/the-simple-way-computers-work/>). They all have the same software installed an access to the same data.

This setup is necessary so the next node in line can pick up where the previous one left off.

The nodes in a cluster will all be assigned the same [IP address](<https://chadunderwood.com/hey-whats-an-ip-address/>) and host name (name used to identify a server from other servers).

One node runs at a time since one server can have a host name and IP address on a company's network. This is how the network knows to go to the backup server. This setup makes the switch seamless.

When you have 2 servers with the same IP address will cause connection issues with both of the servers.

Server clusters are another piece to keeping an application up and running without ever going down.

However, they are not required for every server in a data center.
