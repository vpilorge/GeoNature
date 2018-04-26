#!/bin/bash

# Make sure only root can run our script
if [ "$(id -u)" == "0" ]; then
   echo "This script must not be run as root" 1>&2
   exit 1
fi

. ../../config/settings.ini

mkdir /tmp/geonature

echo "Create validation schema..."
echo "--------------------" &> /var/log/geonature/install_validation_schema.log
echo "Create validation schema" &>> /var/log/geonature/install_validation_schema.log
echo "--------------------" &>> /var/log/geonature/install_validation_schema.log
echo "" &>> /var/log/geonature/install_validation_schema.log
cp data/validation.sql /tmp/geonature/validation.sql
sudo sed -i "s/MYLOCALSRID/$srid_local/g" /tmp/geonature/validation.sql
export PGPASSWORD=$user_pg_pass;psql -h $db_host -U $user_pg -d $db_name -f /tmp/geonature/validation.sql  &>> /var/log/geonature/install_validation_schema.log

echo "Create export validation view(s)..."
echo "--------------------" &> /var/log/geonature/install_validation_schema.log
echo "Create export validation view(s)" &>> /var/log/geonature/install_validation_schema.log
echo "--------------------" &>> /var/log/geonature/install_validation_schema.log
echo "" &>> /var/log/geonature/install_validation_schema.log
export PGPASSWORD=$user_pg_pass;psql -h $db_host -U $user_pg -d $db_name -f data/exports_validation.sql  &>> /var/log/geonature/install_validation_schema.log


echo "INSTALL SAMPLE  = $add_sample_data "
if $add_sample_data
	then
	echo "Insert sample data in validation schema..."
	echo "" &>> /var/log/geonature/install_validation_schema.log
	echo "" &>> /var/log/geonature/install_validation_schema.log
	echo "" &>> /var/log/geonature/install_validation_schema.log
	echo "--------------------" &>> /var/log/geonature/install_validation_schema.log
	echo "Insert sample data in validation schema..." &>> /var/log/geonature/install_validation_schema.log
	echo "--------------------" &>> /var/log/geonature/install_validation_schema.log
	echo "" &>> /var/log/geonature/install_validation_schema.log
	export PGPASSWORD=$user_pg_pass;psql -h $db_host -U $user_pg -d $db_name -f data/sample_data.sql  &>> /var/log/geonature/install_validation_schema.log
fi

echo "Cleaning files..."
    rm /tmp/geonature/*.sql
