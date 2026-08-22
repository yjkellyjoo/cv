---
title: NVD data crawling scheduler
summary: Spring Boot job that keeps a local mirror of the U.S. National Vulnerability Database current.
icon: 📋
dateStart: 2018-11-01
dateEnd: 2019-08-23
stacks: [MyBatis, MySQL (MariaDB), Spring]
topics: [CVE]
scale: Big
links:
  - label: Labrador
    url: https://labrador.iotcube.com/
---

The National Vulnerability Database is a set of U.S. government data feeds describing software vulnerabilities.
I built a Spring Boot scheduler with MyBatis, in Java, that runs in the background on a server and periodically collects and updates a local copy.

![Database schema](../../assets/projects/nvd-crawling-scheduler/schema.png)

I designed the MySQL schema to hold everything NVD provides while staying flexible enough to search against.
The data fed vulnerability detection in [Labrador](https://labrador.iotcube.com/), IoTcube's product — and later became the foundation for building the Solidity vulnerability dataset.
