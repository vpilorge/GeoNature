--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.7
-- Dumped by pg_dump version 9.6.7

-- Started on 2018-05-25 15:41:20 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 95771)
-- Name: gn_intero; Type: SCHEMA; Schema: -; Owner: geonatuser
--

CREATE SCHEMA gn_intero;


ALTER SCHEMA gn_intero OWNER TO geonatuser;

SET search_path = gn_intero, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 363 (class 1259 OID 95785)
-- Name: bib_formats; Type: TABLE; Schema: gn_intero; Owner: geonatuser
--

CREATE TABLE bib_formats (
    id_export_format integer NOT NULL,
    export_json boolean,
    export_rdf boolean,
    export_csv boolean
);


ALTER TABLE bib_formats OWNER TO geonatuser;

--
-- TOC entry 364 (class 1259 OID 95790)
-- Name: cor_exports_roles; Type: TABLE; Schema: gn_intero; Owner: geonatuser
--

CREATE TABLE cor_exports_roles (
    id_cor_exports_roles integer NOT NULL,
    roles character(255)
);


ALTER TABLE cor_exports_roles OWNER TO geonatuser;

--
-- TOC entry 361 (class 1259 OID 95772)
-- Name: t_exports; Type: TABLE; Schema: gn_intero; Owner: geonatuser
--

CREATE TABLE t_exports (
    id_export integer NOT NULL,
    liste_export character(255)
);


ALTER TABLE t_exports OWNER TO geonatuser;

--
-- TOC entry 362 (class 1259 OID 95780)
-- Name: t_exports_logs; Type: TABLE; Schema: gn_intero; Owner: geonatuser
--

CREATE TABLE t_exports_logs (
    id_export_logs integer NOT NULL,
    export_logs_comment character(255)
);


ALTER TABLE t_exports_logs OWNER TO geonatuser;

--
-- TOC entry 365 (class 1259 OID 95805)
-- Name: v_export; Type: VIEW; Schema: gn_intero; Owner: geonatuser
--

CREATE VIEW v_export WITH (security_barrier='false') AS
 SELECT export_occtax_sinp."nomCite",
    export_occtax_sinp."dateDebut",
    export_occtax_sinp."dateFin",
    export_occtax_sinp."heureDebut",
    export_occtax_sinp."heureFin",
    export_occtax_sinp."altMax",
    export_occtax_sinp."altMin",
    export_occtax_sinp."cdNom",
    export_occtax_sinp."cdRef"
   FROM pr_contact.export_occtax_sinp;


ALTER TABLE v_export OWNER TO geonatuser;

--
-- TOC entry 4066 (class 0 OID 95785)
-- Dependencies: 363
-- Data for Name: bib_formats; Type: TABLE DATA; Schema: gn_intero; Owner: geonatuser
--

COPY bib_formats (id_export_format, export_json, export_rdf, export_csv) FROM stdin;
\.


--
-- TOC entry 4067 (class 0 OID 95790)
-- Dependencies: 364
-- Data for Name: cor_exports_roles; Type: TABLE DATA; Schema: gn_intero; Owner: geonatuser
--

COPY cor_exports_roles (id_cor_exports_roles, roles) FROM stdin;
\.


--
-- TOC entry 4064 (class 0 OID 95772)
-- Dependencies: 361
-- Data for Name: t_exports; Type: TABLE DATA; Schema: gn_intero; Owner: geonatuser
--

COPY t_exports (id_export, liste_export) FROM stdin;
\.


--
-- TOC entry 4065 (class 0 OID 95780)
-- Dependencies: 362
-- Data for Name: t_exports_logs; Type: TABLE DATA; Schema: gn_intero; Owner: geonatuser
--

COPY t_exports_logs (id_export_logs, export_logs_comment) FROM stdin;
\.


--
-- TOC entry 3898 (class 2606 OID 95789)
-- Name: bib_formats bib_formats_pkey; Type: CONSTRAINT; Schema: gn_intero; Owner: geonatuser
--

ALTER TABLE ONLY bib_formats
    ADD CONSTRAINT bib_formats_pkey PRIMARY KEY (id_export_format);


--
-- TOC entry 3900 (class 2606 OID 95794)
-- Name: cor_exports_roles cor_exports_roles_pkey; Type: CONSTRAINT; Schema: gn_intero; Owner: geonatuser
--

ALTER TABLE ONLY cor_exports_roles
    ADD CONSTRAINT cor_exports_roles_pkey PRIMARY KEY (id_cor_exports_roles);


--
-- TOC entry 3896 (class 2606 OID 95784)
-- Name: t_exports_logs t_export_logs_pkey; Type: CONSTRAINT; Schema: gn_intero; Owner: geonatuser
--

ALTER TABLE ONLY t_exports_logs
    ADD CONSTRAINT t_export_logs_pkey PRIMARY KEY (id_export_logs);


--
-- TOC entry 3894 (class 2606 OID 95779)
-- Name: t_exports t_exports_pkey; Type: CONSTRAINT; Schema: gn_intero; Owner: geonatuser
--

ALTER TABLE ONLY t_exports
    ADD CONSTRAINT t_exports_pkey PRIMARY KEY (id_export);


-- Completed on 2018-05-25 15:41:21 CEST

--
-- PostgreSQL database dump complete
--
