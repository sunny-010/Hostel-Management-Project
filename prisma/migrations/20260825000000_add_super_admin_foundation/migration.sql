
-- Add SuperAdmin foundation

-- Add account status and SUPER_ADMIN role
ALTER TABLE `User`
ADD COLUMN `status` ENUM('ACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'ACTIVE',
MODIFY `role` ENUM('SUPER_ADMIN', 'ADMIN', 'STUDENT') NOT NULL;
