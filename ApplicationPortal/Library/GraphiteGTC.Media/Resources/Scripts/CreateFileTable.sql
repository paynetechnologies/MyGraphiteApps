ALTER DATABASE $$$DatabaseName$$$
  ADD FILEGROUP MediaFileStreamGroup CONTAINS FILESTREAM;
GO

DECLARE @FileStreamLocation AS NVARCHAR(MAX)
DECLARE @FileStreamSQL AS NVARCHAR(MAX)
SET @FileStreamLocation = (SELECT CONCAT(SUBSTRING(physical_name, 1, CHARINDEX(N'$$$DatabaseName$$$.mdf', LOWER(physical_name)) - 1), 'MediaFileStream')
                             FROM master.sys.master_files
                            WHERE master.sys.master_files.name = '$$$DatabaseName$$$'
				              AND physical_name LIKE '%$$$DatabaseName$$$.mdf' )
SET @FileStreamSQL = 'ALTER DATABASE $$$DatabaseName$$$ ADD FILE(NAME = ''MediaFileStream'', FILENAME = ' + QuoteName(@FileStreamLocation, '''')  + ')  TO FILEGROUP MediaFileStreamGroup;'
EXEC(@FileStreamSQL)
GO

ALTER DATABASE $$$DatabaseName$$$
  SET FILESTREAM (NON_TRANSACTED_ACCESS = FULL, DIRECTORY_NAME = N'MediaFileStream')
GO

CREATE TABLE MediaFileStore AS FileTable
  WITH ( 
        FileTable_Directory = 'MediaFileStore',
        FileTable_Collate_Filename = database_default
       );
GO
