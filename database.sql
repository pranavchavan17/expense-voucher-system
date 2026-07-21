-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: expense_voucher_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ACCOUNTS','DIRECTOR','EMPLOYEE') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `signature_content_type` varchar(100) DEFAULT NULL,
  `signature_file_name` varchar(255) DEFAULT NULL,
  `signature_file_path` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'2026-07-21 17:05:41.865026','director@gmail.com','Director','$2a$10$ZBak.Mp7c4HkisPHGVKN8OjIMCU3bgCxwsdImR4OYNdmCMJDlLTi2','DIRECTOR','2026-07-21 19:52:37.094420','image/jpeg','093017ca-2af8-4d71-9a00-4458b4cbbcde.jpg','D:\\expense-voucher-system\\expense-voucher-system\\expense-voucher-system\\uploads\\signatures\\directors\\093017ca-2af8-4d71-9a00-4458b4cbbcde.jpg'),(7,'2026-07-21 17:06:03.277107','account@gmail.com','Accounts','$2a$10$wO6VykeNBqu92JvJJTAWwuNMz25zqyZBgemZSRF3Fs8STrhnfUpPW','ACCOUNTS','2026-07-21 17:06:03.277107',NULL,NULL,NULL),(8,'2026-07-21 17:14:27.757825','pranav@gmail.com','Pranav Chavan','$2a$10$Jfn5lM1YsuZAJ1Ad8bGezuKbs8NAfYsSuWmDYKPfdYLdA.UV9te9i','EMPLOYEE','2026-07-21 19:50:36.031600','image/jpeg','25fe96df-f63f-400a-81a4-63e4ece332e3.jpg','D:\\expense-voucher-system\\expense-voucher-system\\expense-voucher-system\\uploads\\signatures\\employees\\25fe96df-f63f-400a-81a4-63e4ece332e3.jpg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-21 21:17:49
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: expense_voucher_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(19,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `department` varchar(150) NOT NULL,
  `expense_category` varchar(150) NOT NULL,
  `expense_date` date NOT NULL,
  `expense_description` varchar(1000) NOT NULL,
  `expense_title` varchar(255) NOT NULL,
  `status` enum('APPROVED','DRAFT','PAID','REJECTED','SUBMITTED') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `voucher_date` date NOT NULL,
  `voucher_number` varchar(50) NOT NULL,
  `user_id` bigint NOT NULL,
  `approval_date` datetime(6) DEFAULT NULL,
  `rejection_reason` varchar(1000) DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `payment_reference` varchar(50) DEFAULT NULL,
  `receipt_content_type` varchar(100) DEFAULT NULL,
  `receipt_file_name` varchar(255) DEFAULT NULL,
  `receipt_file_path` varchar(1024) DEFAULT NULL,
  `approved_by_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK217e2eukoldhugxd7nn3hac03` (`voucher_number`),
  UNIQUE KEY `UK7joyiytjim67pitibfqwtn4ye` (`payment_reference`),
  KEY `FK3sgwux4uor7og45vdilosjha8` (`user_id`),
  KEY `FK6enqaxy7huhfgwat3rgd8h8xi` (`approved_by_user_id`),
  CONSTRAINT `FK3sgwux4uor7og45vdilosjha8` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK6enqaxy7huhfgwat3rgd8h8xi` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (6,2500.00,'2026-07-21 17:30:35.964589','IT','Office Supplies','2026-07-20','Purchased a replacement charger for office laptop.','Laptop Charger','PAID','2026-07-21 17:53:25.269146','2026-07-21','VCH-20260721-8D4B5325',8,'2026-07-21 17:49:54.317119',NULL,'2026-07-21 17:53:25.161133','PAY-20260721-000001',NULL,NULL,NULL,6),(7,3849.81,'2026-07-21 19:13:38.773772','Finance','Office Supplies','2026-07-21','Purchased HP printer toner cartridges for the finance department printer.','Printer Toner','REJECTED','2026-07-21 19:16:39.175239','2026-07-21','VCH-20260721-F97E355B',8,NULL,'dhkhkfjk',NULL,NULL,NULL,NULL,NULL,NULL),(8,1850.00,'2026-07-21 19:50:00.447739','Sales','Travel','2026-07-20','Monthly high-speed broadband recharge for remote development work.','Client Meeting Travel','PAID','2026-07-21 19:54:58.874947','2026-07-21','VCH-20260721-11E4B649',8,'2026-07-21 19:53:05.783553',NULL,'2026-07-21 19:54:58.838950','PAY-20260721-000002','image/jpeg','8aa967e6-7490-46de-97bb-1e382d9eae2a.jpg','D:\\expense-voucher-system\\expense-voucher-system\\expense-voucher-system\\uploads\\8aa967e6-7490-46de-97bb-1e382d9eae2a.jpg',6),(9,7200.00,'2026-07-21 20:18:16.388807','Sales','Travel','2026-07-21','Hotel accommodation for an overnight client meeting in Mumbai.','Hotel Stay','PAID','2026-07-21 20:21:19.598057','2026-07-21','VCH-20260721-D3E57898',8,'2026-07-21 20:19:40.563130',NULL,'2026-07-21 20:21:19.585062','PAY-20260721-000003','image/jpeg','5d0a3a5c-9342-4ec5-961e-59b16a5b10ed.jpg','D:\\expense-voucher-system\\expense-voucher-system\\expense-voucher-system\\uploads\\5d0a3a5c-9342-4ec5-961e-59b16a5b10ed.jpg',6);
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-21 21:17:49
