---
title: "Virtualization: the school bus of technology"
slug: virtualization-the-school-bus-of-technology
date: "2022-06-07T05:43:00.000Z"
updated: "2022-09-14T11:02:29.000Z"
edition: 1
tags: ["business tech", "server", "servers", "virtual machine", "virtualization", "Articles", "Technology"]
summary: During the school year, we all see the familiar yellow color driving down the road. The school bus. School districts use buses because they’re efficient. They can get many kids to school in less time […]
status: published
---

During the school year, we all see the familiar yellow color driving down the road. The school bus.

School districts use buses because they're efficient. They can get many kids to school in less time and cost than other modes of transportation.

The average school bus holds around 100 kids. Taking 100 kids and having each kid ride in a single car would use so much space on the road and gas. This is inefficient.

There is a technology called virtualization.

It has the same effect as school buses on data centers.

![](https://chadunderwood.com/wp-content/uploads/2022/06/school-bus-picture-1024x768.jpg)Photo by [Jannis Lucas](<https://unsplash.com/@jannis_lucas?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>) on [Unsplash](<https://unsplash.com/s/photos/school-bus?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>)

In our example a [server](<https://chadunderwood.com/servers-simplified/>) is the school bus. The kids are the virtualization.

In a data center, you have many racks of servers. These racks can contain up to 48 servers.

But inside the servers is where the magic happens. The servers will the virtual machines (servers that have not physical hardware but act like a physical server you can touch and see) installed. There can be as many virtual machines as the server can handle.

This allows a data center to operate more efficient for the same reason the school bus is efficient.

With virtualization you can make 1 server do the job of many servers using the same amount of electricity.

## What is virtualization?

Virtualization is the process of using one server to act like it’s many servers.

## Other technology using virtualization

Servers are the most common things using virtualization. You can also virtualize [desktop operating systems](<https://chadunderwood.com/operating-systems-are-the-middleman-for-computer-data/>). So, if you were running Windows, you would virtualize [Linux ](<https://chadunderwood.com/explain-open-source-software-like-im-5/>)to check it out.

## Necessities for setting up virtualization

  1. A computer/server with a processor capable of virtualization.
  2. A hypervisor.

# What is a hypervisor?

A hypervisor is the software allowing you to create virtual machines. It allows you to “build” a virtual system. In the hypervisor, you can setup how much [RAM, hard drive space, and how many processors it will get](<https://chadunderwood.com/the-simple-way-computers-work/>). Then you can load an iso file (image of a CD/DVD disc) with the operating system you want to install.

### What are some of the popular hypervisors?

  * HyperV — Microsoft
  * VMware — VMware
  * Parallels Desktop (made only for MacOS)
  * VirtualBox

## Accessing these virtual machines

You can access them via a remote console. This means you need to access a website then connect to the VM from a website.

If the VM is installed on the computer you are using, you can access it from the hypervisor.

Windows based OSes can be connected via a Remote desktop connection (RDP).

Linux based OSes can be accessed using SSH or install a remote desktop app on the virtual machine.
