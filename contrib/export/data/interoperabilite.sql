SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;


CREATE SCHEMA IF NOT EXISTS gn_interos;

SET search_path = gn_interos, pg_catalog;

CREATE TABLE t_exports();
CREATE TABLE t_exports_logs();
CREATE TABLE bib_formats();
CREATE TABLE cor_exports_roles();

COMMENT ON TABLE t_exports IS 'Cette table est utilisée pour déclarer les exports.';
COMMENT ON TABLE t_exports_logs IS 'Cette table regroupe les logs.';
COMMENT ON TABLE bib_formats IS 'Bibliothèque de l ensemble des formats utiles.';
COMMENT ON TABLE cor_exports_roles IS 'Est la table de correspondances des divers roles possibles.';

