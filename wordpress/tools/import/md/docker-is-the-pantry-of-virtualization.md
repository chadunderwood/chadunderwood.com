---
title: Docker is the pantry of virtualization
slug: docker-is-the-pantry-of-virtualization
date: "2022-06-14T05:40:00.000Z"
updated: "2022-09-14T11:51:43.000Z"
edition: 1
tags: ["business tech", "containerization", "Docker", "virtualization", "Articles", "Technology"]
summary: Docker is the Rubbermaid of server hosting. If you’re on Instagram, you’ve come across the dream pantry. Each shelf is organized from top to bottom. Each item is labeled in its own container. Docker helps […]
status: published
---

Docker is the Rubbermaid of server hosting.

If you’re on Instagram, you’ve come across the dream pantry. Each shelf is organized from top to bottom. Each item is labeled in its own container.

Docker helps create the dream pantry of virtualization.

![](https://chadunderwood.com/wp-content/uploads/2022/06/muradi-0b8NaL2CMaQ-unsplash-1024x683.jpg)Photo by [Muradi](<https://unsplash.com/es/@simuradi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>) on [Unsplash](<https://unsplash.com/s/photos/pantry?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText>)

Last week, I [showed you how virtualization](<https://chadunderwood.com/virtualization-the-school-bus-of-technology/>) takes one server and turns it into many virtual servers called virtual machines (VM).

## Containerization

Docker creates virtual machines called containers. This is called containerization. Containerization is an operating system level virtualization.

[Operating system](<https://chadunderwood.com/operating-systems-are-the-middleman-for-computer-data/>) virtualization uses parts of the installed operating system to create a bootable environment to run apps.

In the description of the pantry, the server is the pantry. The operating system is the shelf. Docker is the storage containers. The items inside the containers are the applications.

Although, VMs and containers are similar concepts, they are different in the way they function.

## The setup

When you create a virtual machine, you must assign it a processor, RAM, and hard drive. Then you need to install an operating system. Now you can install the application to run on the [server](<https://www.chadunderwood.com/servers-simplified>).

This means each application would need it own processor, RAM, hard drive, and operating system.

Docker runs inside of the operating system.

## Difference between VMs and Docker containers

This is what makes Docker containers more efficient than virtual machines. Each app doesn’t need its own OS. Instead the Docker daemon (software) is installed in the operating system. The container has the necessary files needed to make the app run. Then Docker daemon pulls the needed boot files from the operating system it is installed on.

For business use, you would pick a server. Then install an operating system. You would then boot the operating system and install docker.

Once docker is installed, you create the container which pulls an image (all the files for the application) you want to run.

To create a second app, you spin up another container using the same pool of resources as the first and a different image file.

Here’s an example of the resource use for the same applications.

## Virtual Machine

**Application 1**

The operating system needs 4 GB of RAM and 2 processors and 40 GB of hard drive space. Then your app needs 1 GB of RAM, 1 processor and 2 GB of hard drive space.

**Application 2**

The operating system needs 4 GB of RAM and 2 processors and 40 GB of hard drive space. Then your app needs 2GB of RAM, 1 processor and 2 GB of hard drive space.

To run these 2 applications your server would need a minimum

  * 2 servers
  * 11 GB of RAM
  * 6 processors
  * 84 GB of hard drive space

## Docker

**Application 1**

The operating system needs 4 GB of RAM and 2 processors and 40 GB of hard drive space. Then your application needs 1 GB of RAM, 1 processor and 2GB of hard drive space.

**Application 2**

Your app needs 2GB of RAM, 1 processor and 2 GB of hard drive space.

To run these 2 applications your server would need a minimum

  * 1 server
  * 7 GB RAM
  * 4 processors
  * 44 GB hard drive space

Notice the drop in needed resources because you don’t need a 2nd operating system for the 2nd application. When you add a 3rd app the efficiency gets even better.

Note: This example of the needed resources is extremely simplified. You would never create a server with the bare minimum resources needed.

This technology allows developers to share, test, and deploy code easier and faster.

With normal virtual machines a developer would have an engineer create a server, load the operating system. Each time they want to update the application they need to update the application through the IT department.

With Docker, they run a quick command to pull the latest image and restart the container. This takes seconds to complete.

For the company it saves money on resources and make the infrastructure more manageable with less people.
