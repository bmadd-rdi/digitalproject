--
-- PostgreSQL database cluster dump
--

\restrict QrRp3BROm6eQegf3VBln7srWotAfRiDlBwXRdaEgaoJ4yzructzGOq4xhdHQXFs

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Drop databases (except postgres and template1)
--

DROP DATABASE bma_db;




--
-- Drop roles
--

DROP ROLE postgres;


--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:tLT1VENqqpk9GyUznsjJiA==$UJPlaCYKeJQbSKqAhl4sQFfbCbPALplectsCNehPM+Q=:73FNoMdNhWlQG/REj3OVf4JemOwxg8EQqtWUkJFykBQ=';

--
-- User Configurations
--








\unrestrict QrRp3BROm6eQegf3VBln7srWotAfRiDlBwXRdaEgaoJ4yzructzGOq4xhdHQXFs

--
-- Databases
--

--
-- Database "template1" dump
--

--
-- PostgreSQL database dump
--

\restrict GvA0p7Fs2xlEbBqOjrSu6PINbL0RYSy1DNAGFALFLuqIa7DMwU106eIdGaF7MhQ

-- Dumped from database version 15.19 (Debian 15.19-1.pgdg13+2)
-- Dumped by pg_dump version 15.19 (Debian 15.19-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

UPDATE pg_catalog.pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
--
-- Name: template1; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE template1 OWNER TO postgres;

\unrestrict GvA0p7Fs2xlEbBqOjrSu6PINbL0RYSy1DNAGFALFLuqIa7DMwU106eIdGaF7MhQ
\connect template1
\restrict GvA0p7Fs2xlEbBqOjrSu6PINbL0RYSy1DNAGFALFLuqIa7DMwU106eIdGaF7MhQ

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: template1; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE template1 IS_TEMPLATE = true;


\unrestrict GvA0p7Fs2xlEbBqOjrSu6PINbL0RYSy1DNAGFALFLuqIa7DMwU106eIdGaF7MhQ
\connect template1
\restrict GvA0p7Fs2xlEbBqOjrSu6PINbL0RYSy1DNAGFALFLuqIa7DMwU106eIdGaF7MhQ

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: ACL; Schema: -; Owner: postgres
--

REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict GvA0p7Fs2xlEbBqOjrSu6PINbL0RYSy1DNAGFALFLuqIa7DMwU106eIdGaF7MhQ

--
-- Database "bma_db" dump
--

--
-- PostgreSQL database dump
--

\restrict F8vVVokyxLlVVyyhUFvPsYhtDDyfwFJFlbqxKdjzbDaZ5ZNmHfwsMEWluEyuIOI

-- Dumped from database version 15.19 (Debian 15.19-1.pgdg13+2)
-- Dumped by pg_dump version 15.19 (Debian 15.19-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: bma_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE bma_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE bma_db OWNER TO postgres;

\unrestrict F8vVVokyxLlVVyyhUFvPsYhtDDyfwFJFlbqxKdjzbDaZ5ZNmHfwsMEWluEyuIOI
\connect bma_db
\restrict F8vVVokyxLlVVyyhUFvPsYhtDDyfwFJFlbqxKdjzbDaZ5ZNmHfwsMEWluEyuIOI

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cost_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cost_type AS ENUM (
    'IT',
    'NON_IT'
);


ALTER TYPE public.cost_type OWNER TO postgres;

--
-- Name: food_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.food_type AS ENUM (
    'PARTIAL_MEAL',
    'FULL_MEAL',
    'SNACK',
    'OTHER'
);


ALTER TYPE public.food_type OWNER TO postgres;

--
-- Name: location_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.location_type AS ENUM (
    'GOVERNMENT',
    'PRIVATE'
);


ALTER TYPE public.location_type OWNER TO postgres;

--
-- Name: meeting_document_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.meeting_document_type AS ENUM (
    'MEETING_DOCUMENT',
    'MEETING_MINUTES'
);


ALTER TYPE public.meeting_document_type OWNER TO postgres;

--
-- Name: meeting_resolution_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.meeting_resolution_type AS ENUM (
    'APPROVED',
    'ACKNOWLEDGED',
    'CONDITIONAL_APPROVAL',
    'RECONSIDER',
    'NOT_APPROVED',
    'NOT_CONSIDERED'
);


ALTER TYPE public.meeting_resolution_type OWNER TO postgres;

--
-- Name: personnel_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.personnel_type AS ENUM (
    'CORE',
    'ASST',
    'SUPP'
);


ALTER TYPE public.personnel_type OWNER TO postgres;

--
-- Name: project_return_stage; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_return_stage AS ENUM (
    'SMALL_BOARD',
    'BIG_BOARD'
);


ALTER TYPE public.project_return_stage OWNER TO postgres;

--
-- Name: project_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_type AS ENUM (
    'NEW',
    'REPLACEMENT',
    'CONTINUOUS'
);


ALTER TYPE public.project_type OWNER TO postgres;

--
-- Name: proposal_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.proposal_status AS ENUM (
    'draft',
    'submitted',
    'passed_1',
    'rejected_1',
    'fix_1',
    'admin_assigned',
    'passed_2',
    'rejected_2',
    'fix_2',
    'meeting_scheduled',
    'meeting_passed',
    'fix_3',
    'fix_4',
    'meeting_rejected'
);


ALTER TYPE public.proposal_status OWNER TO postgres;

--
-- Name: reference_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reference_type AS ENUM (
    'MDES',
    'MARKET',
    'PREVIOUS',
    'OTHER'
);


ALTER TYPE public.reference_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agenda_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agenda_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


ALTER TABLE public.agenda_types OWNER TO postgres;

--
-- Name: agenda_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agenda_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.agenda_types_id_seq OWNER TO postgres;

--
-- Name: agenda_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agenda_types_id_seq OWNED BY public.agenda_types.id;


--
-- Name: agendas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agendas (
    id uuid NOT NULL,
    meeting_id uuid NOT NULL,
    project_id uuid,
    agenda_number character varying(50) NOT NULL,
    sort_order integer NOT NULL,
    agenda_type_id integer NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.agendas OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(255) NOT NULL,
    department_code character varying(8) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: deputy_governors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deputy_governors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    activate boolean DEFAULT true NOT NULL
);


ALTER TABLE public.deputy_governors OWNER TO postgres;

--
-- Name: deputy_governors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deputy_governors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deputy_governors_id_seq OWNER TO postgres;

--
-- Name: deputy_governors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deputy_governors_id_seq OWNED BY public.deputy_governors.id;


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.divisions (
    division_id integer NOT NULL,
    department_id integer NOT NULL,
    division_name character varying(255) NOT NULL,
    division_code character varying(8) NOT NULL
);


ALTER TABLE public.divisions OWNER TO postgres;

--
-- Name: divisions_division_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.divisions_division_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.divisions_division_id_seq OWNER TO postgres;

--
-- Name: divisions_division_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.divisions_division_id_seq OWNED BY public.divisions.division_id;


--
-- Name: four_quadrants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.four_quadrants (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.four_quadrants OWNER TO postgres;

--
-- Name: four_quadrants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.four_quadrants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.four_quadrants_id_seq OWNER TO postgres;

--
-- Name: four_quadrants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.four_quadrants_id_seq OWNED BY public.four_quadrants.id;


--
-- Name: meeting_attachment_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_attachment_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


ALTER TABLE public.meeting_attachment_types OWNER TO postgres;

--
-- Name: meeting_attachment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meeting_attachment_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.meeting_attachment_types_id_seq OWNER TO postgres;

--
-- Name: meeting_attachment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meeting_attachment_types_id_seq OWNED BY public.meeting_attachment_types.id;


--
-- Name: meeting_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_attachments (
    id uuid NOT NULL,
    meeting_id uuid NOT NULL,
    agenda_id uuid,
    meeting_doc_type_id integer NOT NULL,
    uploaded_by uuid NOT NULL,
    file_name character varying(500) NOT NULL,
    file_url character varying(1000) NOT NULL,
    file_type character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    document_type public.meeting_document_type DEFAULT 'MEETING_DOCUMENT'::public.meeting_document_type NOT NULL,
    original_file_name character varying(500),
    stored_file_name character varying(500),
    storage_path character varying(1000),
    mime_type character varying(100),
    size_bytes bigint,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.meeting_attachments OWNER TO postgres;

--
-- Name: meeting_resolution_revisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_resolution_revisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resolution_id uuid NOT NULL,
    project_id uuid NOT NULL,
    revision_number integer NOT NULL,
    previous_resolution_type character varying(64),
    new_resolution_type character varying(64) NOT NULL,
    previous_remark text,
    new_remark text,
    previous_project_status_id integer,
    new_project_status_id integer NOT NULL,
    previous_latest_approved_budget numeric(15,2),
    new_latest_approved_budget numeric(15,2),
    reason text,
    changed_by uuid NOT NULL,
    change_mode character varying(40) NOT NULL,
    changed_at timestamp without time zone DEFAULT now() NOT NULL,
    previous_final_approved_budget numeric(15,2),
    new_final_approved_budget numeric(15,2),
    previous_final_estimated_cost numeric(15,2),
    new_final_estimated_cost numeric(15,2)
);


ALTER TABLE public.meeting_resolution_revisions OWNER TO postgres;

--
-- Name: meeting_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_statuses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


ALTER TABLE public.meeting_statuses OWNER TO postgres;

--
-- Name: meeting_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meeting_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.meeting_statuses_id_seq OWNER TO postgres;

--
-- Name: meeting_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meeting_statuses_id_seq OWNED BY public.meeting_statuses.id;


--
-- Name: meeting_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


ALTER TABLE public.meeting_types OWNER TO postgres;

--
-- Name: meeting_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meeting_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.meeting_types_id_seq OWNER TO postgres;

--
-- Name: meeting_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meeting_types_id_seq OWNED BY public.meeting_types.id;


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meetings (
    id uuid NOT NULL,
    meeting_no character varying(100) NOT NULL,
    title character varying(500) NOT NULL,
    meeting_type_id integer NOT NULL,
    meeting_date timestamp without time zone NOT NULL,
    location character varying(500),
    meeting_status_id integer NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    description text,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    cancel_reason text
);


ALTER TABLE public.meetings OWNER TO postgres;

--
-- Name: policy_governor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policy_governor (
    policy_id integer NOT NULL,
    policy_code character varying(20) NOT NULL,
    policy_name character varying(255) NOT NULL
);


ALTER TABLE public.policy_governor OWNER TO postgres;

--
-- Name: policy_governor_policy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.policy_governor_policy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.policy_governor_policy_id_seq OWNER TO postgres;

--
-- Name: policy_governor_policy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.policy_governor_policy_id_seq OWNED BY public.policy_governor.policy_id;


--
-- Name: project_attachment_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_attachment_types (
    doc_type_id integer NOT NULL,
    code character varying(64),
    doc_type_name character varying(255) NOT NULL
);


ALTER TABLE public.project_attachment_types OWNER TO postgres;

--
-- Name: project_attachment_types_doc_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_attachment_types_doc_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_attachment_types_doc_type_id_seq OWNER TO postgres;

--
-- Name: project_attachment_types_doc_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_attachment_types_doc_type_id_seq OWNED BY public.project_attachment_types.doc_type_id;


--
-- Name: project_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_attachments (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    doc_type_id integer NOT NULL,
    uploaded_by uuid NOT NULL,
    file_name character varying(500) NOT NULL,
    file_url character varying(1000) NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size bigint,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_attachments OWNER TO postgres;

--
-- Name: project_sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_sequences (
    year integer NOT NULL,
    last_value integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.project_sequences OWNER TO postgres;

--
-- Name: project_status_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_status_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    old_status_id integer NOT NULL,
    new_status_id integer NOT NULL,
    remark text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    source_operation character varying(100),
    meeting_id uuid,
    agenda_id uuid,
    resolution_id uuid
);


ALTER TABLE public.project_status_logs OWNER TO postgres;

--
-- Name: project_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_statuses (
    project_status_id integer NOT NULL,
    code character varying(64),
    project_status_name character varying(255) NOT NULL
);


ALTER TABLE public.project_statuses OWNER TO postgres;

--
-- Name: project_statuses_project_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_statuses_project_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_statuses_project_status_id_seq OWNER TO postgres;

--
-- Name: project_statuses_project_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_statuses_project_status_id_seq OWNED BY public.project_statuses.project_status_id;


--
-- Name: project_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_types (
    project_type_id integer NOT NULL,
    code character varying(64),
    project_type_name character varying(255) NOT NULL
);


ALTER TABLE public.project_types OWNER TO postgres;

--
-- Name: project_types_project_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_types_project_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_types_project_type_id_seq OWNER TO postgres;

--
-- Name: project_types_project_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_types_project_type_id_seq OWNED BY public.project_types.project_type_id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    project_id uuid NOT NULL,
    project_code character varying(50),
    user_id uuid NOT NULL,
    division_id integer NOT NULL,
    project_status_id integer DEFAULT 1 NOT NULL,
    project_type_id integer,
    four_quadrants_id integer NOT NULL,
    deputy_governor_id integer NOT NULL,
    initial_requested_budget numeric(15,2),
    latest_requested_budget numeric(15,2),
    external_task_id character varying(255),
    project_name character varying(600),
    project_name_original character varying(600),
    analyst_id uuid,
    assigned_by uuid,
    assigned_at timestamp without time zone,
    is_public boolean DEFAULT false NOT NULL,
    public_token character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    deleted_at timestamp without time zone,
    return_stage public.project_return_stage,
    workflow_version integer DEFAULT 0 NOT NULL,
    final_approved_budget numeric(15,2),
    initial_estimated_cost numeric(15,2),
    latest_estimated_cost numeric(15,2),
    final_estimated_cost numeric(15,2)
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: COLUMN projects.project_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.project_code IS 'รหัสโครงการ';


--
-- Name: COLUMN projects.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.user_id IS 'รหัสผู้ใช้';


--
-- Name: COLUMN projects.division_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.division_id IS 'รหัสส่วนราชการ';


--
-- Name: COLUMN projects.project_status_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.project_status_id IS 'รหัสสถานะ';


--
-- Name: COLUMN projects.project_type_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.project_type_id IS 'ประเภทโครงการ';


--
-- Name: proposal_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_budgets (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    year integer,
    amount numeric(15,2),
    budget_type character varying(255)
);


ALTER TABLE public.proposal_budgets OWNER TO postgres;

--
-- Name: proposal_cloud_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_cloud_requests (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    system_name text NOT NULL,
    requested_service_date timestamp without time zone,
    recorded_request_date timestamp without time zone
);


ALTER TABLE public.proposal_cloud_requests OWNER TO postgres;

--
-- Name: proposal_cloud_vms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_cloud_vms (
    id uuid NOT NULL,
    cloud_request_id uuid NOT NULL,
    vm_description text NOT NULL,
    os_database character varying(255),
    vcpu integer DEFAULT 0,
    ram_gb integer DEFAULT 0,
    gpu_gb integer DEFAULT 0,
    storage_gb integer DEFAULT 0,
    price numeric(15,2) DEFAULT '0'::numeric
);


ALTER TABLE public.proposal_cloud_vms OWNER TO postgres;

--
-- Name: proposal_drafts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_drafts (
    draft_id uuid NOT NULL,
    project_id uuid,
    user_id uuid NOT NULL,
    project_name text,
    objective text,
    requested_budget_total numeric(15,2),
    current_step integer DEFAULT 1 NOT NULL,
    draft_payload jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    estimated_cost_total numeric(15,2)
);


ALTER TABLE public.proposal_drafts OWNER TO postgres;

--
-- Name: proposal_existing_equipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_existing_equipments (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name character varying(255),
    age_years numeric(5,2),
    quantity integer,
    user_name character varying(255),
    location text,
    remark text
);


ALTER TABLE public.proposal_existing_equipments OWNER TO postgres;

--
-- Name: proposal_hardware_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_hardware_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name text,
    quantity integer,
    unit_price numeric(15,2),
    reference_type public.reference_type,
    mdes_month character varying(50),
    mdes_year character varying(10),
    mdes_item_no character varying(100),
    market_count integer,
    market_company text,
    prev_project text,
    prev_year character varying(10),
    other_detail text
);


ALTER TABLE public.proposal_hardware_costs OWNER TO postgres;

--
-- Name: proposal_ict_personnel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_ict_personnel (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    "position" character varying(255),
    level character varying(255),
    count integer
);


ALTER TABLE public.proposal_ict_personnel OWNER TO postgres;

--
-- Name: proposal_manpower; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_manpower (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    agency_part character varying(255),
    position_limit integer,
    occupied integer,
    vacant integer
);


ALTER TABLE public.proposal_manpower OWNER TO postgres;

--
-- Name: proposal_other_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_other_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name text,
    quantity integer,
    unit_price numeric(15,2),
    remark text,
    cost_type public.cost_type
);


ALTER TABLE public.proposal_other_costs OWNER TO postgres;

--
-- Name: proposal_personnel_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_personnel_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    personnel_type public.personnel_type NOT NULL,
    "position" character varying(255),
    degree character varying(255),
    field_of_study character varying(255),
    experience_years numeric(4,1),
    base_salary numeric(15,2),
    multiplier numeric(5,3),
    person_count integer,
    duration_months integer
);


ALTER TABLE public.proposal_personnel_costs OWNER TO postgres;

--
-- Name: proposal_personnel_responsibilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_personnel_responsibilities (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    "position" character varying(255),
    responsibility text
);


ALTER TABLE public.proposal_personnel_responsibilities OWNER TO postgres;

--
-- Name: proposal_related_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_related_projects (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    project_name text,
    agency character varying(255),
    fiscal_year character varying(10),
    relation_type character varying(255),
    remark text
);


ALTER TABLE public.proposal_related_projects OWNER TO postgres;

--
-- Name: proposal_software_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_software_costs (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    item_name text,
    quantity integer,
    unit_price numeric(15,2),
    reference_type public.reference_type,
    mdes_month character varying(50),
    mdes_year character varying(10),
    mdes_item_no character varying(100),
    market_count integer,
    market_company text,
    prev_project text,
    prev_year character varying(10),
    other_detail text
);


ALTER TABLE public.proposal_software_costs OWNER TO postgres;

--
-- Name: proposal_training_food_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_training_food_costs (
    id uuid NOT NULL,
    training_id uuid NOT NULL,
    item_name public.food_type NOT NULL,
    meals_count integer NOT NULL,
    rate_per_meal numeric(10,2) NOT NULL,
    trainees_count integer NOT NULL,
    days integer NOT NULL
);


ALTER TABLE public.proposal_training_food_costs OWNER TO postgres;

--
-- Name: proposal_training_speaker_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_training_speaker_costs (
    id uuid NOT NULL,
    training_id uuid NOT NULL,
    item_name text NOT NULL,
    hours integer NOT NULL,
    rate_per_hour numeric(10,2) NOT NULL,
    days integer NOT NULL
);


ALTER TABLE public.proposal_training_speaker_costs OWNER TO postgres;

--
-- Name: proposal_trainings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_trainings (
    id uuid NOT NULL,
    proposal_id uuid NOT NULL,
    course_name text,
    training_method character varying(255),
    location_type public.location_type,
    has_speaker_cost boolean DEFAULT false,
    speaker_reason text
);


ALTER TABLE public.proposal_trainings OWNER TO postgres;

--
-- Name: proposals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposals (
    id uuid NOT NULL,
    status public.proposal_status DEFAULT 'draft'::public.proposal_status NOT NULL,
    project_id uuid,
    user_id uuid NOT NULL,
    updated_by uuid,
    version integer DEFAULT 1,
    project_name text,
    agency_name character varying(255),
    head_of_agency character varying(255),
    dcio_name character varying(255),
    project_manager character varying(255),
    requested_budget_total numeric(15,2),
    background text,
    objective text,
    target text,
    scope text,
    project_type public.project_type,
    current_system_status text,
    current_problems text,
    is_bma_plan boolean DEFAULT false,
    is_agency_plan boolean DEFAULT false,
    agency_strategy text,
    agency_issue text,
    agency_kpi text,
    is_governor_policy boolean DEFAULT false,
    governor_policy_code character varying(100),
    governor_policy_name text,
    obstacle_laws text,
    app_architecture text,
    data_owner character varying(255),
    data_exchange_plan text,
    is_ready boolean DEFAULT false,
    readiness_details text,
    duration_days integer,
    other_readiness text,
    expected_benefits text,
    is_in_roadmap boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    estimated_cost_total numeric(15,2),
    submitted_at timestamp without time zone,
    department_id integer,
    division_id integer,
    project_ever_passed character varying(10),
    prev_presented_year character varying(4),
    prev_project_name_mode character varying(10),
    prev_presented_project text,
    prev_resolution character varying(40),
    bma_plan_strategy text,
    bma_plan_issue text,
    bma_plan_kpi text
);


ALTER TABLE public.proposals OWNER TO postgres;

--
-- Name: resolution_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resolution_statuses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(64)
);


ALTER TABLE public.resolution_statuses OWNER TO postgres;

--
-- Name: resolution_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resolution_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resolution_statuses_id_seq OWNER TO postgres;

--
-- Name: resolution_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resolution_statuses_id_seq OWNED BY public.resolution_statuses.id;


--
-- Name: resolutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resolutions (
    id uuid NOT NULL,
    agenda_id uuid NOT NULL,
    resolution_status_id integer NOT NULL,
    comment text,
    recorded_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    resolution_type public.meeting_resolution_type,
    remark text,
    resolved_at timestamp without time zone,
    version integer DEFAULT 1 NOT NULL,
    governed_proposal_id uuid
);


ALTER TABLE public.resolutions OWNER TO postgres;

--
-- Name: role_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_user (
    user_id uuid NOT NULL,
    role_id integer NOT NULL,
    assigned_by uuid,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_user OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    code character varying(64),
    role_name character varying(50) NOT NULL,
    description character varying(255)
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_role_id_seq OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: user_login_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_login_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ip_address character varying(45),
    user_agent character varying(512),
    login_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_login_history OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    "position" character varying(150),
    level character varying(100),
    management_position character varying(150),
    division_id integer,
    mobile_phone character varying(20),
    office_phone character varying(20),
    internal_extension character varying(10),
    is_active boolean DEFAULT true NOT NULL,
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    is_verified boolean DEFAULT false NOT NULL,
    verification_token character varying(255),
    verification_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: workflow_audit_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_audit_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    reason text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workflow_audit_events OWNER TO postgres;

--
-- Name: agenda_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda_types ALTER COLUMN id SET DEFAULT nextval('public.agenda_types_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: deputy_governors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deputy_governors ALTER COLUMN id SET DEFAULT nextval('public.deputy_governors_id_seq'::regclass);


--
-- Name: divisions division_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions ALTER COLUMN division_id SET DEFAULT nextval('public.divisions_division_id_seq'::regclass);


--
-- Name: four_quadrants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.four_quadrants ALTER COLUMN id SET DEFAULT nextval('public.four_quadrants_id_seq'::regclass);


--
-- Name: meeting_attachment_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachment_types ALTER COLUMN id SET DEFAULT nextval('public.meeting_attachment_types_id_seq'::regclass);


--
-- Name: meeting_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_statuses ALTER COLUMN id SET DEFAULT nextval('public.meeting_statuses_id_seq'::regclass);


--
-- Name: meeting_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_types ALTER COLUMN id SET DEFAULT nextval('public.meeting_types_id_seq'::regclass);


--
-- Name: policy_governor policy_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_governor ALTER COLUMN policy_id SET DEFAULT nextval('public.policy_governor_policy_id_seq'::regclass);


--
-- Name: project_attachment_types doc_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachment_types ALTER COLUMN doc_type_id SET DEFAULT nextval('public.project_attachment_types_doc_type_id_seq'::regclass);


--
-- Name: project_statuses project_status_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_statuses ALTER COLUMN project_status_id SET DEFAULT nextval('public.project_statuses_project_status_id_seq'::regclass);


--
-- Name: project_types project_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_types ALTER COLUMN project_type_id SET DEFAULT nextval('public.project_types_project_type_id_seq'::regclass);


--
-- Name: resolution_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolution_statuses ALTER COLUMN id SET DEFAULT nextval('public.resolution_statuses_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Data for Name: agenda_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agenda_types (id, name, code) FROM stdin;
1	Chairman's Announcements	FOR_INFORMATION
2	Adoption of Minutes	APPROVE_MINUTES
3	Matters Arising / Follow-up	FOLLOW_UP
4	Matters for Consideration	FOR_CONSIDERATION
5	Any Other Business	OTHER
\.


--
-- Data for Name: agendas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agendas (id, meeting_id, project_id, agenda_number, sort_order, agenda_type_id, title, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_name, department_code) FROM stdin;
1	สำนักงานเลขานุการสภากรุงเทพมหานคร	01000000
2	สำนักงานเลขานุการผู้ว่าราชการกรุงเทพมหานคร	02000000
3	สำนักงานคณะกรรมการข้าราชการกรุงเทพมหานคร	03000000
4	สำนักปลัดกรุงเทพมหานคร	04000000
5	สำนักการแพทย์	07000000
6	สำนักอนามัย	08000000
7	สำนักการศึกษา	09000000
8	สำนักการโยธา	10000000
9	สำนักการระบายน้ำ	11000000
10	สำนักการคลัง	14000000
11	สำนักเทศกิจ	15000000
12	สำนักการจราจรและขนส่ง	17000000
13	สำนักผังเมือง	18000000
14	สำนักป้องกันและบรรเทาสาธารณภัย	19000000
15	สำนักงบประมาณกรุงเทพมหานคร	20000000
16	สำนักยุทธศาสตร์และประเมินผล	21000000
17	สำนักสิ่งแวดล้อม	22000000
18	สำนักวัฒนธรรม กีฬาและการท่องเที่ยว	23000000
19	สำนักพัฒนาสังคม	24000000
20	สำนักการวางผังและพัฒนาเมือง	25000000
21	สำนักดิจิทัลกรุงเทพมหานคร	26000000
22	ศูนย์รับเรื่องร้องเรียน	49000000
23	การพาณิชย์ของกรุงเทพมหานคร	51000000
24	มหาวิทยาลัยกรุงเทพมหานคร	99000000
25	กรุงเทพมหานคร	00000000
26	สำนักนโยบายและแผนกรุงเทพมหานคร	06000000
27	สำนักรักษาความสะอาด	12000000
28	สำนักสวัสดิการสังคม	13000000
29	สำนักพัฒนาชุมชน	16000000
30	สำนักงานเขตพระนคร	50010000
31	สำนักงานเขตป้อมปราบศัตรูพ่าย	50020000
32	สำนักงานเขตสัมพันธวงศ์	50030000
33	สำนักงานเขตบางรัก	50040000
34	สำนักงานเขตปทุมวัน	50050000
35	สำนักงานเขตยานนาวา	50060000
36	สำนักงานเขตดุสิต	50070000
37	สำนักงานเขตพญาไท	50080000
38	สำนักงานเขตห้วยขวาง	50090000
39	สำนักงานเขตพระโขนง	50100000
40	สำนักงานเขตบางกะปิ	50110000
41	สำนักงานเขตบางเขน	50120000
42	สำนักงานเขตมีนบุรี	50130000
43	สำนักงานเขตลาดกระบัง	50140000
44	สำนักงานเขตหนองจอก	50150000
45	สำนักงานเขตธนบุรี	50160000
46	สำนักงานเขตคลองสาน	50170000
47	สำนักงานเขตบางกอกใหญ่	50180000
48	สำนักงานเขตบางกอกน้อย	50190000
49	สำนักงานเขตตลิ่งชัน	50200000
50	สำนักงานเขตภาษีเจริญ	50210000
51	สำนักงานเขตหนองแขม	50220000
52	สำนักงานเขตบางขุนเทียน	50230000
53	สำนักงานเขตราษฎร์บูรณะ	50240000
54	สำนักงานเขตดอนเมือง	50250000
55	สำนักงานเขตจตุจักร	50260000
56	สำนักงานเขตลาดพร้าว	50270000
57	สำนักงานเขตบึงกุ่ม	50280000
58	สำนักงานเขตสาทร	50290000
59	สำนักงานเขตบางคอแหลม	50300000
60	สำนักงานเขตบางซื่อ	50310000
61	สำนักงานเขตราชเทวี	50320000
62	สำนักงานเขตคลองเตย	50330000
63	สำนักงานเขตประเวศ	50340000
64	สำนักงานเขตบางพลัด	50350000
65	สำนักงานเขตจอมทอง	50360000
66	สำนักงานเขตดินแดง	50370000
67	สำนักงานเขตสวนหลวง	50380000
68	สำนักงานเขตวัฒนา	50390000
69	สำนักงานเขตบางแค	50400000
70	สำนักงานเขตหลักสี่	50410000
71	สำนักงานเขตสายไหม	50420000
72	สำนักงานเขตคันนายาว	50430000
73	สำนักงานเขตสะพานสูง	50440000
74	สำนักงานเขตวังทองหลาง	50450000
75	สำนักงานเขตคลองสามวา	50460000
76	สำนักงานเขตบางนา	50470000
77	สำนักงานเขตทวีวัฒนา	50480000
78	สำนักงานเขตทุ่งครุ	50490000
79	สำนักงานเขตบางบอน	50500000
\.


--
-- Data for Name: deputy_governors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deputy_governors (id, name, activate) FROM stdin;
2	รผว.วิศณุ	t
3	รผว.ทวิดา	t
4	รผว.ศานนท์	t
5	รผว.พรพรหม	t
1	รผว.จักกพันธุ์	f
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.divisions (division_id, department_id, division_name, division_code) FROM stdin;
1	25	กรุงเทพมหานคร	00000000
2	1	สำนักงานเลขานุการสภากรุงเทพมหานคร	01000000
3	1	ส่วนวิชาการ	01010000
4	2	สํานักงานเลขานุการผู้ว่าราชการกรุงเทพมหานคร	02000000
5	3	สำนักงานคณะกรรมการข้าราชการกรุงเทพมหานคร	03000000
6	3	กองบริหารทั่วไป	03010000
7	3	กองอัตรากำลัง	03020000
8	3	กองทะเบียนประวัติข้าราชการ	03030000
9	3	กองวินัยและเสริมสร้างจริยธรรม	03040000
10	3	กองสรรหาบุคคล	03050000
11	3	กองระบบงาน	03060000
12	3	กองพิทักษ์ระบบคุณธรรม	03070000
13	4	สํานักปลัดกรุงเทพมหานคร	04000000
14	4	สำนักงานเลขานุการปลัดกรุงเทพมหานคร	04210000
15	4	สำนักงานการเจ้าหน้าที่	04190000
16	4	สำนักงานปกครองและทะเบียน	04170000
17	4	สำนักงานตรวจสอบภายใน	04180000
18	4	กองงานผู้ตรวจราชการ	04080000
19	4	สถาบันพัฒนาข้าราชการ กทม.	04090000
20	4	สำนักงานประชาสัมพันธ์	04200000
21	4	สำนักงานกฎหมายและคดี	04150000
22	4	สำนักงานการต่างประเทศ	04160000
23	26	สำนักนโยบายและแผนกรุงเทพมหานคร	06000000
24	26	สำนักงานเลขานุการ	06010000
25	26	กองนโยบายและแผนรวม	06020000
26	26	กองแผนสาธารณูปโภคและ สวล.	06030000
27	26	กองแผนทรัพยากรมนุษย์และสังคม	06040000
28	26	กองแผนบริหารและการคลัง	06050000
29	26	กองการต่างประเทศ	06080000
30	26	กองพัฒนาระบบงานคอมพิวเตอร์	06090000
31	26	กองควบคุมระบบคอมพิวเตอร์	06100000
32	26	กองบริการระบบคอมพิวเตอร์	06110000
33	26	กองสารสนเทศภูมิศาสตร์	06120000
34	5	สำนักการแพทย์	07000000
35	5	สำนักงานเลขานุการ	07010000
36	5	สำนักงานพัฒนาระบบบริการทางการแพทย์  	07180000
37	5	วิทยาลัยพยาบาลเกื้อการุณย์	07030000
38	5	โรงพยาบาลกลาง	07050000
39	5	โรงพยาบาลตากสิน	07060000
40	5	โรงพยาบาลเจริญกรุงประชารักษ์	07070000
41	5	โรงพยาบาลหลวงพ่อทวีศักดิ์ ชุตินฺธโรอุทิศ	07080000
42	5	โรงพยาบาลเวชการุณย์รัศมี์	07160000
43	5	โรงพยาบาลลาดกระบัง กทม.	07100000
44	5	โรงพยาบาลหนองจอก	07090000
45	5	โรงพยาบาลราชพิพัฒน์	07130000
46	5	โรงพยาบาลสิรินธร	07140000
47	5	ศูนย์บริการการแพทย์ฉุกเฉินกรุงเทพมหานคร (ศูนย์เอราวัณ)	07150000
48	5	โรงพยาบาลผู้สูงอายุบางขุนเทียน	07170000
49	5	โรงพยาบาลคลองสามวา	07190000
50	5	โรงพยาบาลบางนากรุงเทพมหานคร	07200000
51	6	สำนักอนามัย	08000000
52	6	สำนักงานเลขานุการ	08010000
53	6	กองสร้างเสริมสุขภาพ	08030000
54	6	กองการพยาบาลสาธารณสุข	08040000
55	6	กองทันตสาธารณสุข	08050000
56	6	สำนักงานสัตวแพทย์สาธารณสุข	08750000
57	6	กองควบคุมโรคติดต่อ	08080000
58	6	สำนักงานป้องกันและบำบัดการติดยาเสพติด	08740000
59	6	กองควบคุมโรคเอดส์ วัณโรค และโรคติดต่อทางเพศสัมพันธ์	08730000
60	6	กองเภสัชกรรม	08110000
61	6	ศูนย์บริการสาธารณสุข 1 สะพานมอญ	08120000
62	6	ศูนย์บริการสาธารณสุข 2 ราชปรารภ	08130000
63	6	ศูนย์บริการสาธารณสุข 3 บางซื่อ	08140000
64	6	ศูนย์บริการสาธารณสุข 4 ดินแดง	08150000
65	6	ศูนย์บริการสาธารณสุข 5 จุฬาลงกรณ์	08160000
66	6	ศูนย์บริการสาธารณสุข 6 สโมสรวัฒนธรรมหญิง	08170000
193	11	สำนักงานเลขานุการ	15010000
67	6	ศูนย์บริการสาธารณสุข 7 บุญมี ปุรุราชรังสรรค์	08180000
68	6	ศูนย์บริการสาธารณสุข 8 บุญรอด รุ่งเรือง	08190000
69	6	ศูนย์บริการสาธารณสุข 9 ประชาธิปไตย	08200000
70	6	ศูนย์บริการสาธารณสุข 10 สุขุมวิท	08210000
71	6	ศูนย์บริการสาธารณสุข 11 ประดิพัทธ์	08220000
72	6	ศูนย์บริการสาธารณสุข 12 จันทร์เที่ยง เนตรวิเศษ	08230000
73	6	ศูนย์บริการสาธารณสุข 13 ไมตรีวานิช	08240000
74	6	ศูนย์บริการสาธารณสุข 14 แก้วสีบุญเรือง	08250000
75	6	ศูนย์บริการสาธารณสุข 15 ลาดพร้าว	08260000
76	6	ศูนย์บริการสาธารณสุข 16 ลุมพินี	08270000
77	6	ศูนย์บริการสาธารณสุข 17 ประชานิเวศน์	08280000
78	6	ศูนย์บริการสาธารณสุข 18 มงคล-วอน วังตาล	08290000
79	6	ศูนย์บริการสาธารณสุข 19 วงศ์สว่าง	08300000
80	6	ศูนย์บริการสาธารณสุข 20 ธนาคารศรีนคร	08310000
81	6	ศูนย์บริการสาธารณสุข 21 วัดธาตุทอง	08320000
82	6	ศูนย์บริการสาธารณสุข 22 วัดปากบ่อ	08330000
83	6	ศูนย์บริการสาธารณสุข 23 สี่พระยา	08340000
84	6	ศูนย์บริการสาธารณสุข 24 บางเขน	08350000
85	6	ศูนย์บริการสาธารณสุข 25 ห้วยขวาง	08360000
86	6	ศูนย์บริการสาธารณสุข 26 เจ้าคุณประยูรวงศ์	08370000
87	6	ศูนย์บริการสาธารณสุข 27 จันทร์ฉิม ไพบูลย์	08380000
88	6	ศูนย์บริการสาธารณสุข 28 กรุงธนบุรี	08390000
89	6	ศูนย์บริการสาธารณสุข 29 ช่วง นุชเนตร	08400000
90	6	ศูนย์บริการสาธารณสุข 30 วัดเจ้าอาม	08410000
91	6	ศูนย์บริการสาธารณสุข 31 เอิบ - จิตร ทังสุบุตร	08420000
92	6	ศูนย์บริการสาธารณสุข 32 มาริษ ตินตมุสิก	08430000
93	6	ศูนย์บริการสาธารณสุข 33 วัดหงส์รัตนาราม	08440000
94	6	ศูนย์บริการสาธารณสุข 34 โพธิ์ศรี	08450000
95	6	ศูนย์บริการสาธารณสุข 35 หัวหมาก	08460000
96	6	ศูนย์บริการสาธารณสุข 36 บุคคโล	08470000
97	6	ศูนย์บริการสาธารณสุข 37 ประสงค์-สุดสาคร ตู้จินดา	08480000
98	6	ศูนย์บริการสาธารณสุข 38 จี๊ด ทองคำ บำเพ็ญ	08490000
99	6	ศูนย์บริการสาธารณสุข 39 ราษฎร์บูรณะ	08500000
100	6	ศูนย์บริการสาธารณสุข 40 บางแค	08510000
101	6	ศูนย์บริการสาธารณสุข 41 คลองเตย	08520000
102	6	ศูนย์บริการสาธารณสุข 42 ถนอม ทองสิมา	08530000
103	6	ศูนย์บริการสาธารณสุข 43 มีนบุรี	08540000
104	6	ศูนย์บริการสาธารณสุข 46 กันตารัติอุทิศ	08550000
105	6	ศูนย์บริการสาธารณสุข 47 คลองขวาง	08560000
106	6	ศูนย์บริการสาธารณสุข 48 นาควัชระอุทิศ	08570000
107	6	ศูนย์บริการสาธารณสุข 49 วัดชัยพฤกษมาลา	08580000
108	6	ศูนย์บริการสาธารณสุข 50 บึงกุ่ม	08590000
109	6	ศูนย์บริการสาธารณสุข 51 วัดไผ่ตัน	08600000
110	6	ศูนย์บริการสาธารณสุข 52 สามเสนนอก	08610000
111	6	ศูนย์บริการสาธารณสุข 53 ทุ่งสองห้อง	08620000
112	6	ศูนย์บริการสาธารณสุข 54 ทัศน์เอี่ยม	08630000
113	6	ศูนย์บริการสาธารณสุข 55 เตชะสัมพันธ์	08640000
114	6	ศูนย์บริการสาธารณสุข 56 ทับเจริญ	08650000
115	6	ศูนย์บริการสาธารณสุข 57 บุญเรือง ล้ำเลิศ	08660000
116	6	ศูนย์บริการสาธารณสุข 58 ล้อม-พิมเสน ฟักอุดม	08670000
117	6	ศูนย์บริการสาธารณสุข 59 ทุ่งครุ	08680000
118	6	ศูนย์บริการสาธารณสุข 60 รสสุคนธ์ มโนชญากร	08690000
119	6	ศูนย์บริการสาธารณสุข 61 สังวาลย์ ทัสนารมย์	08700000
120	6	ศูนย์บริการสาธารณสุข 62 ตวงรัชฏ์ ศศะนาวิน ภักดีฐานปัญญา	08710000
265	19	กองนโยบายและแผนงาน	24020000
121	6	ศูนย์บริการสาธารณสุข 63 สมาคมแต้จิ๋วแห่งประเทศไทย	08880000
122	6	สำนักงานชันสูตรสาธารณสุข	08760000
123	6	ศูนย์บริการสาธารณสุข 44 ลำผักชี หนองจอก	08900000
124	6	ศูนย์บริการสาธารณสุข 45 ร่มเกล้า ลาดกระบัง	08910000
125	6	ศูนย์บริการสาธารณสุข 65 รักษาสุข บางบอน	08920000
126	6	ศูนย์บริการสาธารณสุข 66 ตำหนักพระแม่กวนอิม โชคชัย4	08930000
127	6	สำนักงานพัฒนาระบบสาธารณสุข	08720000
128	6	สำนักงานสุขาภิบาลสิ่งแวดล้อม	08950000
129	6	กองสุขาภิบาลอาหาร	08960000
130	6	ศูนย์บริการสาธารณสุข 64 คลองสามวา	08970000
131	6	ศูนย์บริการสาธารณสุข 67 ทวีวัฒนา	08980000
132	6	ศูนย์บริการสาธารณสุข 68 สะพานสูง	08990000
133	7	สำนักการศึกษา	09000000
134	7	สำนักงานเลขานุการ	09010000
135	7	สำนักงานการเจ้าหน้าที่	09020000
136	7	กองคลัง	09030000
137	7	หน่วยงานศึกษานิเทศก์	09040000
138	7	กองวิชาการ	09060000
139	7	โรงเรียนมัธยมบ้านบางกะปิ	09070000
140	7	โรงเรียนมัธยมประชานิเวศน์	09080000
141	7	โรงเรียนมัธยมนาคนาวาอุปถัมภ์	09090000
142	7	โรงเรียนมัธยมสุวิทย์เสรีอนุสรณ์	09100000
143	7	สำนักงานยุทธศาสตร์การศึกษา	09110000
144	7	กองเทคโนโลยีเพื่อการเรียนการสอน	09120000
145	7	กองพัฒนาข้าราชการครูากรุงเทพมหานคร	09130000
146	7	สำนักงานการเจ้าหน้าที่	09140000
147	8	สำนักการโยธา	10000000
148	8	สำนักงานเลขานุการ	10010000
149	8	กองวิเคราะห์และวิจัย	10030000
150	8	กองควบคุมการก่อสร้าง	10060000
151	8	กองควบคุมอาคาร	10070000
152	8	กองแผนงานและประสานสาธารณูปโภค	10090000
153	8	สำนักงานก่อสร้างและบูรณะ	10100000
154	8	สำนักงานออกแบบ	10110000
155	8	กองสำรวจและแผนที่ที่ดิน	10120000
156	8	สำนักงานจัดกรรมสิทธิ์	10130000
157	8	สำนักงานวิศวกรรมทาง	10160000
158	9	สำนักการระบายน้ำ	11000000
159	9	สำนักงานเลขานุการ	11010000
160	9	กองเครื่องจักรกล	11060000
161	9	กองสารสนเทศระบายน้ำ	11080000
162	9	สำนักงานระบบควบคุมน้ำ	11160000
163	9	กองระบบท่อระบายน้ำ	11100000
164	9	กองระบบคลอง	11110000
165	9	กองจัดการคุณภาพน้ำ	11120000
166	9	สำนักงานจัดการคุณภาพน้ำ	11130000
167	9	สำนักงานพัฒนาระบบระบายน้ำ	11140000
168	27	สำนักรักษาความสะอาด	12000000
169	27	สำนักงานเลขานุการ	12010000
170	27	กองบริการรักษาความสะอาด	12020000
171	27	กองควบคุมสิ่งปฏิกูล	12030000
172	27	กองโรงงานกำจัดมูลฝอย	12040000
173	27	กองวิชาการและแผนงาน	12050000
174	28	สำนักสวัสดิการสังคม	13000000
175	28	สำนักงานเลขานุการ	13010000
176	28	กองสังคมสงเคราะห์	13020000
177	28	กองนันทนาการ	13040000
178	28	กองการกีฬา	13050000
179	28	สำนักงานสวนสาธารณะ	13060000
180	28	กองสวัสดิภาพเด็ก สตรี ผู้สูงอายุ ผู้พิการ และผู้ด้อยโอกาส	13070000
181	10	สํานักการคลัง	14000000
182	10	สำนักงานเลขานุการ	14010000
183	10	กองรายได้	14020000
184	10	กองการเงิน	14030000
185	10	กองทะเบียนทรัพย์สินและพัสดุ	14040000
186	10	กองบัญชี	14050000
187	10	กองระบบการคลัง	14060000
188	10	กองโรงงานช่างกล	14070000
189	10	กองตรวจจ่าย	14080000
190	10	สำนักงานเศรษฐกิจการคลัง	14090000
191	10	กองบำเหน็จบำนาญ	14100000
192	11	สํานักเทศกิจ	15000000
194	11	กองวิชาการและแผนงาน	15020000
195	11	กองตรวจการเทศกิจ	15030000
196	11	กองนโยบายและแผนงาน	15050000
197	11	กองตรวจและปฏิบัติการพื้นที่ 1	15060000
198	11	กองนิติการและบังคับคดี	15110000
199	29	สำนักพัฒนาชุมชน	16000000
200	29	สำนักงานเลขานุการ	16010000
201	29	กองส่งเสริมอาชีพ	16030000
202	29	กองวิชาการและแผนงาน	16130000
203	29	กองการพัฒนาชุมชน	16140000
204	12	สํานักการจราจรและขนส่ง	17000000
205	12	สำนักงานเลขานุการ	17010000
206	12	สำนักงานระบบขนส่ง	17040000
207	12	กองนโยบายและแผนงาน	17120000
208	12	สำนักงานวิศวกรรมจราจร	17130000
209	12	กองพัฒนาระบบจราจร	17140000
210	13	สำนักการวางผังและพัฒนาเมือง	18000000
211	13	สำนักงานเลขานุการ	18010000
212	13	กองสำรวจและแผนที่	18030000
213	13	กองวางผังพัฒนาเมือง	18050000
214	13	กองจัดรูปที่ดินและปรับปรุงฟื้นฟูเมือง	18060000
215	13	กองควบคุมทางผังเมือง	18070000
216	13	กองนโยบายและแผนงาน	18080000
217	14	สำนักป้องกันและบรรเทาสาธารณภัย	19000000
218	14	สำนักงานเลขานุการ	19010000
219	14	กองวิชาการและแผนงาน	19020000
220	14	กองอำนวยการป้องกันและบรรเทาสาธารณภัย	19030000
221	14	กองปฏิบัติการดับเพลิง 1	19040000
222	14	กองปฏิบัติการดับเพลิง 2	19050000
223	14	กองปฏิบัติการดับเพลิง 3	19060000
224	14	กองปฏิบัติการดับเพลิง 4	19070000
225	14	กองปฏิบัติการดับเพลิง 5	19080000
226	14	กองปฏิบัติการดับเพลิง 6	19090000
227	15	สำนักงบประมาณกรุงเทพมหานคร	20000000
228	15	สำนักงานเลขานุการ	20010000
229	15	สำนักงานระบบงบประมาณ	20070000
230	15	กองวิเคราะห์งบประมาณ 1	20030000
231	15	กองวิเคราะห์งบประมาณ 2	20040000
232	15	กองวิเคราะห์งบประมาณ 3	20050000
233	15	กองวิเคราะห์งบประมาณ 4	20060000
234	15	กองวิเคราะห์งบประมาณ 5	20080000
235	15	กองวิเคราะห์งบประมาณ 6	20090000
236	16	สำนักยุทธศาสตร์และประเมินผล	21000000
237	16	สำนักงานเลขานุการ	21010000
238	16	กองยุทธศาสตร์บริหารจัดการ	21020000
239	16	กองยุทธศาสตร์เศรษฐกิจ การเงิน และการคลัง	21030000
240	16	กองยุทธศาสตร์สาธารณสุขและสิ่งแวดล้อม	21040000
241	16	กองยุทธศาสตร์สาธารณูปโภคพื้นฐาน	21050000
242	16	กองยุทธศาสตร์ทรัพยากรมนุษย์และสังคม	21060000
243	16	กองพัฒนาระบบงานคอมพิวเตอร์	21070000
244	16	กองควบคุมระบบคอมพิวเตอร์	21080000
245	16	กองบริการระบบคอมพิวเตอร์	21090000
246	16	กองสารสนเทศภูมิศาสตร์	21100000
247	17	สำนักสิ่งแวดล้อม	22000000
248	17	สำนักงานเลขานุการ	22010000
249	17	กองนโยบายและแผนงาน	22020000
250	17	กองจัดการขยะ ของเสียอันตรายและสิ่งปฏิกูล	22030000
251	17	กองจัดการคุณภาพอากาศและเสียง	22040000
252	17	กองโรงงานกำจัดมูลฝอย	22050000
253	17	สำนักงานสวนสาธารณะ	22060000
254	18	สำนักวัฒนธรรม กีฬา และการท่องเที่ยว	23000000
255	18	สำนักงานเลขานุการ	23010000
256	18	กองนโยบายและแผนงาน	23020000
257	18	ศูนย์เยาวชนกรุงเทพมหานคร (ไทย - ญี่ปุ่น)	23030000
258	18	สำนักงานนันทนาการและส่งเสริมการเรียนรู้	23090000
259	18	กองการกีฬา	23050000
260	18	กองการสังคีต	23060000
261	18	กองการท่องเที่ยว	23070000
262	18	กองวัฒนธรรม	23080000
263	19	สำนักพัฒนาสังคม	24000000
264	19	สำนักงานเลขานุการ	24010000
266	19	กองการพัฒนาชุมชน	24030000
267	19	กองส่งเสริมอาชีพ	24040000
268	19	สำนักงานการสงเคราะห์และสวัสดิภาพสังคม	24050000
269	24	มหาวิทยาลัยกรุงเทพมหานคร	99000000
270	24	สำนักงานอธิการบดี	99010000
271	24	สำนักงานสภามหาวิทยาลัย	99020000
272	24	คณะแพทย์ศาสตร์วชิรพยาบาล	99030000
273	24	คณะพยาบาลศาสตร์เกื้อการุณย์	99040000
274	22	ศูนย์รับเรื่องร้องเรียน	49000000
275	30	-	50010000
276	31	-	50020000
277	32	-	50030000
278	33	-	50040000
279	34	-	50050000
280	35	-	50060000
281	36	-	50070000
282	37	-	50080000
283	38	-	50090000
284	39	-	50100000
285	40	-	50110000
286	41	-	50120000
287	42	-	50130000
288	43	-	50140000
289	44	-	50150000
290	45	-	50160000
291	46	-	50170000
292	47	-	50180000
293	48	-	50190000
294	49	-	50200000
295	50	-	50210000
296	51	-	50220000
297	52	-	50230000
298	53	-	50240000
299	54	-	50250000
300	55	-	50260000
301	56	-	50270000
302	57	-	50280000
303	58	-	50290000
304	59	-	50300000
305	60	-	50310000
306	61	-	50320000
307	62	-	50330000
308	63	-	50340000
309	64	-	50350000
310	65	-	50360000
311	66	-	50370000
312	67	-	50380000
313	68	-	50390000
314	69	-	50400000
315	70	-	50410000
316	71	-	50420000
317	72	-	50430000
318	73	-	50440000
319	74	-	50450000
320	75	-	50460000
321	76	-	50470000
322	77	-	50480000
323	78	-	50490000
324	79	-	50500000
325	3	กองพัฒนาระบบราชการกรุงเทพมหานคร	03080000
326	4	กองกลาง	04010000
327	4	กองการเจ้าหน้าที่	04020000
328	4	กองประชาสัมพันธ์	04110000
329	6	ศูนย์บริการสาธารณสุข 69 คันนายาว	08810000
330	7	กองเทคโนโลยีการศึกษา	09150000
331	7	สถาบันพัฒนาข้าราชการครูและบุคลากรทางการศึกษากรุงเทพมหานคร	09160000
332	7	กองเสริมสร้างสมรรถนะนักเรียน	09170000
333	8	สำนักงานควบคุมอาคาร	10140000
334	8	สำนักงานจัดกรรมสิทธิ์	10150000
335	9	กองพัฒนาระบบหลัก	11070000
336	9	สำนักงานอาคารบังคับน้ำ	11150000
337	11	กองตรวจและปฏิบัติการพื้นที่ 2	15070000
338	11	กองตรวจและปฏิบัติการพื้นที่ 3	15080000
339	11	สำนักงานตรวจและบังคับการ	15100000
340	12	กองระบบเทคโนโลยีจราจร	17150000
341	12	สำนักงานระบบขนส่ง	17160000
342	15	กองวิชาการและแผนงาน	20020000
343	17	สำนักงานจัดการมูลฝอยและสิ่งปฏิกูล	22070000
344	17	กองกำจัดมูลฝอย	22080000
345	18	กองนันทนาการ	23040000
346	18	สำนักงานวัฒนธรรมและการท่องเที่ยว	23100000
347	19	สำนักงานการพัฒนาชุมชน	24060000
348	19	สำนักงานการส่งเสริมอาชีพ	24070000
349	19	สำนักงานสวัสดิการสังคม	24080000
350	20	สำนักการวางผังและพัฒนาเมือง	25000000
351	20	สำนักงานเลขานุการ	25010000
352	20	กองนโยบายและแผนงาน	25020000
353	20	สำนักงานภูมิสารสนเทศ	25030000
354	20	สำนักงานวางผังเมือง	25040000
355	20	สำนักงานพัฒนาและฟื้นฟูเมือง	25050000
356	20	กองควบคุมผังเมือง	25060000
357	23	สำนักงานสถาธนานุบาลกรุงเทพมหานคร	51010000
358	23	สำนักงานตลาดกรุงเทพมหานคร	51020000
359	23	สำนักงานพัฒนาที่อยู่อาศัย	51030000
360	23	กองอำนวยการตลาดนัดกรุงเทพมหานคร	51040000
361	23	บริษัทกรุงเทพธนาคมจำกัด	51050000
362	23	สถานีวิทยุกระจายเสียงกรุงเทพมหานคร	51060000
363	23	สหกรณ์ออมทรัพย์กรุงเทพมหานครจำกัด	51070000
364	3	สถาบันพัฒนาทรัพยากรบุคคลกรุงเทพมหานคร	03090000
365	3	กองโครงสร้างและอัตรากำลัง	03100000
366	3	ศูนย์สารเทศทรัพยากรบุคคล	03110000
367	21	สำนักดิจิทัลกรุงเทพมหานคร	26000000
368	21	สำนักงานเลขานุการ	26010000
369	21	กองยุทธศาสตร์ดิจิทัล	26020000
370	21	กองโครงสร้างพื้นฐานเทคโนโลยีดิจิทัล	26030000
371	21	สำนักงานพัฒนาระบบสารสนเทศดิจิทัล	26040000
\.


--
-- Data for Name: four_quadrants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.four_quadrants (id, name) FROM stdin;
1	เพิ่มประสิทธิภาพ
2	งานประจำที่บริการประชาชน
3	งานหลังบ้านที่เป็นงานใหม่
4	ยุทธศาสตร์ / งานอนาคต
\.


--
-- Data for Name: meeting_attachment_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_attachment_types (id, name, code) FROM stdin;
1	Meeting Document	MEETING_DOCUMENT
2	Meeting Minutes	MEETING_MINUTES
3	Supporting Document	SUPPORTING_DOCUMENT
\.


--
-- Data for Name: meeting_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_attachments (id, meeting_id, agenda_id, meeting_doc_type_id, uploaded_by, file_name, file_url, file_type, created_at, document_type, original_file_name, stored_file_name, storage_path, mime_type, size_bytes, updated_at) FROM stdin;
\.


--
-- Data for Name: meeting_resolution_revisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_resolution_revisions (id, resolution_id, project_id, revision_number, previous_resolution_type, new_resolution_type, previous_remark, new_remark, previous_project_status_id, new_project_status_id, previous_latest_approved_budget, new_latest_approved_budget, reason, changed_by, change_mode, changed_at, previous_final_approved_budget, new_final_approved_budget, previous_final_estimated_cost, new_final_estimated_cost) FROM stdin;
\.


--
-- Data for Name: meeting_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_statuses (id, name, code) FROM stdin;
1	Scheduled	SCHEDULED
2	In Progress	IN_PROGRESS
3	Completed	COMPLETED
4	Cancelled	CANCELLED
5	Draft	DRAFT
\.


--
-- Data for Name: meeting_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_types (id, name, code) FROM stdin;
1	Small Board	คณะกรรมการกลั่นกรอง
2	Big Board	คณะกรรมการนโยบาย
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meetings (id, meeting_no, title, meeting_type_id, meeting_date, location, meeting_status_id, created_by, created_at, updated_at, updated_by, start_time, end_time, description, completed_at, cancelled_at, cancel_reason) FROM stdin;
\.


--
-- Data for Name: policy_governor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policy_governor (policy_id, policy_code, policy_name) FROM stdin;
1	P001	ขยายกิจกรรมเพื่อสุขภาพ เข้าสู่ ชุมชน หมู่บ้าน คอนโด
2	P002	สั่งจ่ายกิจกรรมทางสังคม ปรับการใช้ชีวิต ลดอาการป่วยเรื้อรัง
3	P003	ตรวจสุขภาพฟรีถ้วนหน้า
4	P004	ขยายบริการวัคซีนให้ครอบคลุมหลายกลุ่มโรค
5	P005	พยากรณ์โรคด้วยข้อมูล สู่การออกแบบการดูแลสุขภาพเชิงรุก
6	P006	พัฒนาเครือข่ายการติดตามโรคติดต่อแบบเรียลไทม์
7	P007	ขยายขีดความสามารถให้พร้อมรองรับสิทธิบัตรทองปฐมภูมิให้เป็น 1.3 ล้านสิทธิ
8	P008	นัดหมอโรงพยาบาล กทม. แล้วรอไม่เกิน 1 ชั่วโมง
9	P009	เพิ่มเตียงผู้ป่วยอีก 2,000 เตียง ในโรงพยาบาล กทม. ทั้งเก่าและใหม่
10	P010	ยกระดับศูนย์บริการสาธารณสุขให้เป็นกึ่งทุติยภูมิ
11	P011	ตรวจฟันฟรีที่ศูนย์บริการสาธารณสุข
12	P012	พัฒนาผู้ดูแล 5,000 คน เพื่อผู้ป่วยและผู้สูงอายุที่ต้องได้รับการดูแลต่อเนื่อง
13	P013	ปรับเวลาตรวจโรค ให้สอดคล้องกับเวลาของประชาชน
14	P014	รักษาตัวต่อเนื่อง ส่งยาถึงบ้าน
15	P015	ปรับการบริหารจัดการโรงพยาบาล กทม. พึ่งพางบประมาณจากรัฐน้อยลง
16	P016	เชื่อมโยงข้อมูลสุขภาพข้ามสถานพยาบาล
17	P017	ขยาย Motorlance ให้ครอบคลุมทุกพื้นที่ ช่วยผู้ป่วยฉุกเฉินได้เร็วขึ้น
18	P018	ยกระดับศูนย์บัญชาการการแพทย์ฉุกเฉิน ส่งตัวผู้ป่วยได้เร็วขึ้น
19	P019	พัฒนา Bangkok Minds ข้อมูลสุขภาพใจ คนกรุงเทพฯ รายเขต เพื่อดูแลได้ตรงจุด
20	P020	เพิ่มทักษะบุคลากรให้คัดกรองความเสี่ยงด้านสุขภาพจิตได้เร็วขึ้น
21	P021	ขยายเครือข่ายดูแลใจคนเมืองให้คนเข้าถึงบริการสุขภาพจิตได้ใกล้บ้าน
22	P022	เพิ่มกิจกรรมฮีลใจในพื้นที่สาธารณะ สร้างภูมิคุ้มกันทางใจ
23	P023	แจ้งเบาะแสยาเสพติดอย่างปลอดภัย ไร้ความกังวล
24	P024	ตรวจสารเสพติด รู้ผลไว ใน 24 ชั่วโมง ส่งต่อรับการบำบัดได้ทันที
25	P025	ร่วมมือกับตำรวจ ปปส.ปูพรมตรวจเชิงรุก ชุมชนสีขาว
26	P026	ยกระดับบ้านพิชิตใจ ฟื้นฟูผู้ป่วยครบวงจร
27	P027	คนทำงานมีที่อยู่อาศัยใกล้งาน ด้วยโมเดลเช่า - ออม
28	P028	แก้ไขปัญหาชุมชนแออัด สนับสนุนการออมเพื่อบ้านที่มั่นคงในระยะยาว
29	P029	ยกระดับบ้านมั่นคง สู่การพัฒนาคุณภาพชีวิตครบวงจร
30	P030	แก้กฎหมายปรับปรุงอาคารเก่า เพิ่มตัวเลือกที่อยู่อาศัยให้คนเมือง
31	P031	ปรับปรุงอาคารสงเคราะห์ของ กทม. ให้ได้มาตรฐาน บริหารอย่างมืออาชีพ
32	P032	ศูนย์ประสานงานด้านที่อยู่อาศัย เข้าถึงข้อมูลเรื่องบ้านได้ครบ จบ ในจุดเดียว
33	P033	ผลักดันการออกข้อบัญญัติจัดตั้งกองทุนชุมชน เข้มแข็ง ให้ชุมชนมีส่วนร่วมในการใช้งบประมาณ
34	P034	กระตุ้นการรวมกลุ่ม แก้ไขระเบียบชุมชนให้ครอบคลุมที่อยู่อาศัยทุกประเภท
35	P035	ตรวจสอบสิทธิและสวัสดิการได้ครบในจุดเดียวได้ที่เขตและทางออนไลน์
36	P036	BKK Food Bank ครบวงจร เพิ่มครัวกลาง ชุมชน และหมวดของจำเป็นสำหรับเด็กและผู้สูงวัย
37	P037	ขยายสวนผักชุมชน 50 เขต 1,000 แปลง แหล่งอาหารปลอดภัยของทุกคน
38	P038	ขยายพื้นที่เรียนรู้ด้านดิจิทัลให้คนทุกช่วงวัยในชุมชน
39	P039	จับคู่นักออกแบบกับผู้ผลิตกลุ่มเปราะบาง พัฒนาผลิตภัณฑ์สู่ Marketplace ชั้นนำ
40	P040	จัดทำแผนพัฒนาชุมชน ทุกโครงการ ใช้รายงานเดียวร่วมกัน
41	P041	จัดตั้งศูนย์ดูแลผู้สูงอายุครบวงจร บางขุนเทียน (Aging Institute & Integrated Palliative Care Center)
42	P042	ขยายคลินิกผู้สูงอายุครบวงจรให้ครบในทุกศูนย์ บริการสาธารณสุขและโรงพยาบาลสังกัด กทม.
43	P043	รับออกแบบบ้านปลอดภัยสำหรับผู้สูงอายุ
44	P044	ผ้าอ้อมผู้ใหญ่ฟรีทุกบ้านสำหรับผู้ป่วยผู้สูงอายุ
45	P045	ต่อยอดระบบธนาคารเวลา สู่เครือข่ายดูแลผู้สูงอายุ
46	P046	สนับสนุนโรงเรียนผู้สูงอายุให้มีครบทั้ง 50 เขต
47	P047	ส่งเสริมการจ้างงานผู้สูงอายุใกล้บ้านผ่าน เกษียณ Marketplace
48	P048	ขยายเครือข่ายชมรมและกิจกรรมผู้สูงอายุให้ครอบคลุมทั้งเมือง
49	P049	ขยายจุดสวัสดิการสังคม พร้อมเปิดศูนย์ พักกายให้พักพิงชั่วคราวใน 6 กลุ่มเขต
50	P050	ขยายผลบ้านอิ่มใจ ให้เป็นศูนย์กลางการจ้างงานกลุ่มเปราะบาง
51	P051	ผลักดันการออกข้อบัญญัติในการส่งตัวและจูงใจคนไร้ที่พึ่ง ออกจากพื้นที่สาธารณะเพื่อเข้าสู่กระบวนการดูแลสวัสดิการ
52	P052	ผลักดันการจ้างงานคนพิการในภาครัฐและเอกชน
53	P053	ส่งเสริมความเท่าเทียมในเมืองผ่านโครงการ Bangkok for All
54	P054	รถรับส่งผู้ป่วยพิการและผู้สูงอายุมาโรงพยาบาลฟรี
55	P055	เด็กพิการได้เรียนต่อในระดับมัธยม และเข้าสู่ระบบการศึกษาเพิ่ม 1,500 คน
56	P056	ดูแลแม่และเด็กที่ฝากครรภ์กับโรงพยาบาล กทม.จนถึง 2 ขวบ
57	P057	ขยายการดูแลเด็กเล็ก รองรับเด็กวัย 3 เดือน - 6 ปี 80,000 คน
58	P058	ยกระดับการศึกษาปฐมวัยให้ได้มาตรฐาน โลก ส่งเสริมทักษะสมอง EF ในเด็ก 0-8 ปี
59	P059	ขยายเวลาศูนย์บริการรับเลี้ยงเด็ก กทม. รองรับครอบครัวทำงานนอกเวลา
60	P060	ยกระดับคุณภาพศูนย์พัฒนาเด็กเล็กในกรุงเทพฯ ทุกมิติ
61	P061	เพิ่มบริการคลินิกพัฒนาการเด็กเคลื่อนที่หมุนเวียนในศูนย์พัฒนาเด็กเล็ก
62	P062	ส่งเสริมกิจกรรมเล่นอิสระ (Free Play) ทั่วเมือง ตลอดปี
63	P063	ขยายผล Toy Library ยืมของเล่นกลับบ้านได้ในทุกห้องสมุด
64	P064	ส่งเสริมการอ่านตั้งแต่ในครรภ์ สร้างนิสัยรักการอ่าน
65	P065	ผลักดันกรุงเทพฯ สู่เมืองแห่งความหลากหลาย ระดับโลก และเจ้าภาพ WorldPride 2030
66	P066	ส่งเสริมให้กรุงเทพฯ เป็นเมืองแห่งความเท่าเทียม (DEI City)
67	P067	ขยายบริการ Pride Clinic ให้ครอบคลุมเรื่องการวางแผนครอบครัว
68	P068	ผลักดันการเข้าถึงสิทธิสุขภาพของพนักงานสถานบริการกลางคืน
69	P069	ร้องเรียนได้อย่างปลอดภัย เด็กได้รับการคุ้มครอง
70	P070	โรงเรียนเป็นพื้นที่ปลอดภัยทางใจ เด็กกล้าเปิดใจ มีครูคอยรับฟัง
71	P071	โรงเรียนปลอดภัย สิ่งอำนวยความสะดวกได้มาตรฐาน
72	P072	ส่งเสริมประชาธิปไตยในโรงเรียน ผ่านสภานักเรียนที่เสียงเด็กมีพลัง
73	P073	ลดเวลาหน้าจอ เพิ่มเวลาเรียนรู้ และเวลาอยู่กับเพื่อน
74	P074	เด็กเป็นพลเมืองโลก ได้ถาม ได้คิด ได้ทำ
75	P075	เด็กได้เรียนในแบบของตัวเอง ขยายผลห้องเรียนดิจิทัล ป.4-ม.6 ทุกโรงเรียน
76	P076	เด็กฝึกภาษาอังกฤษได้ทุกวัน ด้วยครู และ AI coach
77	P077	เด็กหาเงินได้ ใช้เงินเป็น เข้าใจภาษีและการลงทุนเบื้องต้น
78	P078	เด็กเรียนวิชาการผ่านการทดลอง และสร้างนวัตกรรม (STEAM)
79	P079	เด็กมีทักษะเอาตัวรอดจากสาธารณภัย และภัยไซเบอร์
80	P080	ระบบประเมินนักเรียนเพื่อพัฒนาศักยภาพในแบบของตัวเอง
81	P081	ส่งเสริมทุนเรียนต่อมัธยม-มหาวิทยาลัย และแลกเปลี่ยนต่างประเทศ
82	P082	โรงเรียนมาตรฐานนานาชาติ และยกระดับ โรงเรียนสองภาษา ให้ครอบคลุมทุกเขต
83	P083	โรงเรียนสาธิตปฐมวัย และพัฒนาคุณภาพโรงเรียนอนุบาลทุกเขต
84	P084	ทุกโรงเรียนมีจุดเด่น เสริมความเป็นเลิศเฉพาะด้าน
85	P085	พื้นที่เรียนรู้ทั่วเมือง ให้เด็กเรียนรู้ได้ทุกวัน
86	P086	ต่อยอดการลดภาระงานครู คืนเวลาให้ครูได้กลับมาอยู่กับนักเรียน
87	P087	ครูโรงเรียน กทม. ได้มีบ้านใกล้งาน
88	P088	คลินิกวิทยฐานะ และปรับเกณฑ์วิทยฐานะให้วัดผลจากตัวผู้เรียน
89	P089	ครูออกแบบการเรียนรู้ของตัวเองได้ผ่าน BMA Learning Hub
90	P090	สร้างชุมชนการเรียนรู้จากครูถึงครู เรียนรู้จากห้องเรียนเพื่อนครู
91	P091	เพิ่มทักษะให้ผู้บริหารโรงเรียนเป็นผู้นำแห่งอนาคต
92	P092	ลดภาระค่าใช้จ่าย เรียนฟรีจริง ไม่มีเก็บเพิ่ม
93	P093	ขยายผลห้องเรียนพ่อแม่ เชื่อมบ้านกับโรงเรียนในการดูแลเด็ก
94	P094	ต่อยอดการเยี่ยมบ้าน สู่การสร้างเครือข่ายเพื่อนเรียน
95	P095	สนับสนุนโมเดล Learn to Earn เรียนได้เงิน ทำงานได้วุฒิ
96	P096	อัปเกรดไฟจราจร เพิ่มระบบควบคุมไฟจราจรแบบเรียลไทม์
97	P097	ปรับปรุงกายภาพ ลดจุดฝืด เพิ่มความคล่องตัวจราจร
98	P098	ทะลุซอยตัน ปรับปรุงการเชื่อมต่อโครงข่ายถนน
99	P099	พัฒนาช่องทางสำหรับจักรยานยนต์
100	P100	ประเมินผลกระทบด้านจราจรจากโครงการขนาดใหญ่
101	P101	บริการจัดการพื้นที่จอดรถและเก็บค่าจอดรถให้มีประสิทธิภาพขึ้น
102	P102	ร่วมมือกับเอกชนพัฒนารถโรงเรียนร่วม ลด ความหนาแน่นของถนนรอบโรงเรียน
103	P103	ปรับปรุง แก้ไขจุดเสี่ยงอุบัติเหตุด้วยการวิเคราะห์ข้อมูล
104	P104	จัดตั้งศูนย์บริหารจัดการเหตุฉุกเฉิน เพิ่มประสิทธิภาพในการเผชิญเหตุ
105	P105	บูรณาการการบังคับใช้กฎหมายร่วมกับหน่วยงานอื่นๆ เพื่อลดปัญหาจราจร
106	P106	รวมข้อมูลขนส่งสาธารณะทุกรูปแบบไว้ในที่เดียว
107	P107	เชื่อมจุดเปลี่ยนถ่ายการขนส่ง เพิ่มความสะดวกในการเดินทาง
108	P108	ปรับปรุงจุดรอรถประจำทางให้ได้มาตรฐานครบทั้งกรุงเทพฯ
109	P109	ส่งเสริมการเชื่อมต่อการขนส่งทางน้ำในคลองสายหลัก
110	P110	ออกแบบค่าโดยสาร BTS ราคาพิเศษสำหรับผู้ใช้ประจำ
111	P111	สนับสนุนการโอน BTS ให้เป็น Single Operator
112	P112	เรียก Feeder ผ่านแอปพลิเคชันได้ แก้ปัญหารถว่าง ผู้โดยสารรอนาน
113	P113	เชื่อมโยงรถขนส่งเอกชน (Feeder) มาให้บริการสาธารณะ
114	P114	สร้างเมืองเดินได้
115	P115	เสนอข้อกำหนดเพื่อประโยชน์ทางภูมิทัศน์เมือง
116	P116	สร้างเมืองปั่นสะดวก
117	P117	ขยายโครงข่ายจักรยานสาธารณะ
118	P118	พัฒนาเมืองเป็นบล็อก ส่งเสริมโครงสร้างพื้นฐานระดับย่าน
119	P119	ผลักดันกฎหมายผังเมืองใหม่ให้ประกาศใช้ในปี พ.ศ.2570
120	P120	พัฒนาแพลตฟอร์มรวบรวมสิทธิประโยชน์และข้อกำหนดทางผังเมือง
121	P121	จับ ปรับผู้ก่อฝุ่นที่ต้นตอ ด้วยทีมนักสืบฝุ่น 2.0
122	P122	ยกระดับความแม่นยำและความละเอียดของการพยากรณ์ฝุ่น
123	P123	เดินหน้ากฎหมายเพื่ออากาศสะอาดของคนกรุงเทพฯ
124	P124	Bangkok and Beyond ติดตามการ เผา และ ช่วยเหลือเกษตรกรแบบครบวงจร
125	P125	Low Emission Zone 2.0 ยกระดับความเข้มข้นเขตมลพิษต่ำ
126	P126	BKK Industrial Watch ติดตามการปล่อย มลพิษจากภาคอุตสาหกรรมตามมาตรฐานใหม่
127	P127	สร้างตลาดคาร์บอนระดับเมือง Bangkok Carbon Credit Hub ส่งเสริมการเปลี่ยนผ่านสู่พลังงานสะอาด
128	P128	ยกระดับมาตรฐานการใช้พลังงานในอาคาร
129	P129	เพิ่มจุดจอดชาร์จรถไฟฟ้า 1,000 จุด
130	P130	สร้างแรงจูงใจเปลี่ยนรถขนส่งสาธารณะให้เป็นพลังงานไฟฟ้า
131	P131	เปลี่ยนรถใน กทม. ให้เป็นรถยนต์ไฟฟ้า
132	P132	Bangkok Reduce - Bangkok Reuse ลดขยะ และ ส่งเสริมการใช้ซ้ำ
133	P133	ส่งเสริมการคัดแยก ผ่านการจัดตั้งศูนย์จัดการขยะในชุมชน
134	P134	เดินหน้าผลักดันข้อบัญญัติจัดการขยะต้นทาง ส่งเสริมการแยกขยะในหมู่บ้าน
135	P135	ส่งเสริมงานที่เกี่ยวข้องกับการจัดการขยะ ผ่านอาสาสมัครด้านสิ่งแวดล้อม
136	P136	ต่อยอดไม่เทรวม เปลี่ยนขยะเป็นเงินผ่านระบบ MRF
137	P137	ยกระดับอ่อนนุช สู่ Bangkok Green Eco Park พื้นที่จัดการขยะรูปแบบใหม่
138	P138	ดึงเอกชนร่วมบริหารจัดการขยะ เพื่อลดปริมาณขยะที่เมืองต้องจัดการ
139	P139	ยกระดับซาเล้ง ขยายขอบเขตการจัดเก็บขยะในระดับครัวเรือน
140	P140	แปลงเศษกิ่งไม้เป็น Biochar ช่วยดูดซับคาร์บอน
141	P141	พัฒนาการรวบรวมน้ำเสีย เพื่อบำบัดน้ำได้อย่างมีประสิทธิภาพขึ้น
142	P142	พัฒนาคลองให้ทำกิจกรรมทางน้ำได้มากขึ้น
143	P143	กวดขัน จูงใจให้อาคารที่เข้าข่ายส่งผลตรวจน้ำเสีย ประจำปี และเชื่อมน้ำเสียเข้ากับระบบของ กทม.
144	P144	เร่งรัดการก่อสร้าง โรงบำบัดน้ำเสีย และระบบรวบรวมน้ำเสียให้แล้วเสร็จ
145	P145	พัฒนาระบบจัดการน้ำเสียที่ต้นทางในพื้นที่หนาแน่นต่ำ
146	P146	ศึกษาความเป็นไปได้ประตูกั้นน้ำคลองภาษีเจริญ กั้นน้ำเสียไม่ให้เข้ากรุงเทพฯ
147	P147	จัดทีมสารวัตรสิ่งแวดล้อมเพื่อตรวจสอบการกระทำความผิด
148	P148	เพิ่มสวนป่าล้อมเมือง ขนาดใหญ่ ครบ 6 กลุ่มเขต
149	P149	ฟื้นฟูระบบนิเวศ ดูแลความหลากหลายของสิ่งมีชีวิตในเมือง
150	P150	เพิ่มและเชื่อมโยงพื้นที่สีเขียวหลากหลายประเภทในเมือง
151	P151	พัฒนาทางเดินสีเขียวให้ร่มรื่นทุกเส้นทาง
152	P152	ปลูกต้นไม้เพิ่มอีก 2 ล้านต้น เพิ่มร่มเงาให้เมือง
153	P153	ขึ้นทะเบียนต้นไม้มรดกกรุงเทพฯ ดูแลต้นไม้ใหญ่ในเมือง
154	P154	ทดแทนพื้นที่สีเขียวที่หายไปด้วยกลไก Green Area Shifting
155	P155	หาจุดพัฒนาพื้นที่สีเขียวเพิ่มเติมด้วยนักสืบพื้นที่สีเขียว
156	P156	พัฒนาพิพิธภัณฑ์ลานคนเมือง
157	P157	พัฒนาศูนย์คนเมืองฝั่งธนฯ - หอศิลป์ พิพิธภัณฑ์เด็ก พื้นที่สาธารณะ ลานกิจกรรม
158	P158	ผลักดันสะพานคนเดินข้ามแม่น้ำแลนด์มาร์กแห่งใหม่ของเมือง
159	P159	เพิ่มพิพิธภัณฑ์เด็ก 2 แห่ง
160	P160	พัฒนาพื้นที่จัดงานขนาดใหญ่ เพื่อรองรับอีเวนต์ระดับโลก
161	P161	ปรับปรุงหอศิลป์กรุงเทพฯ ครั้งใหญ่ในรอบ 15 ปี
162	P162	ฟื้นชีวิตอาคารเก่า สู่พื้นที่สาธารณะสร้างสรรค์ของคนเมือง
163	P163	เปิดโรงเรียนเป็นพื้นที่เรียนรู้ของทุกคน (Open School)
164	P164	เปิดพื้นที่เมืองให้ศิลปินรุ่นใหม่ได้สร้างสรรค์ผลงาน (City as Canvas)
165	P165	1 เขต 1 พื้นที่งานศิลปะ คนเมืองเสพงานศิลป์ได้ใกล้บ้าน
166	P166	เปิด Maker Space พื้นที่ซ่อมแซมสิ่งของ สร้างสรรค์นวัตกรรม
167	P167	สนับสนุนพื้นที่เรียนรู้ใกล้บ้าน สร้างเครือข่ายนักกิจกรรมการเรียนรู้
168	P168	บริหารจัดการพื้นที่จัดแสดงให้เปิดกว้างสำหรับศิลปินทุกคน
169	P169	เพิ่มอีบุ๊ก 10,000 เล่ม และพัฒนาระบบยืมคืนข้ามห้องสมุดให้สะดวกขึ้น
170	P170	เพิ่มพื้นที่และกิจกรรมที่สามารถจองได้ผ่าน publicspace.bangkok.go.th
171	P171	ยกระดับมาตรฐานการจัดอีเวนต์เมือง สะดวก ปลอดภัย ลดผลกระทบต่อชุมชน
172	P172	เพิ่มศูนย์กีฬา และศูนย์นันทนาการ รวม 10 แห่ง
173	P173	ยกระดับพื้นที่ออกกำลังกาย และลานกีฬาคุณภาพ ใกล้บ้านให้ครบ 500 แห่ง
174	P174	เพิ่มสิ่งอำนวยความสะดวกในสวนสาธารณะให้ตอบโจทย์คนรักสุขภาพ
175	P175	พัฒนาลานกีฬาเอ็กซ์ตรีมทั่วเมือง และต่อยอดเป็นพื้นที่สร้างสรรค์
176	P176	ต่อยอดเทศกาลกีฬาของคนกรุงเทพฯ (Bangkok City Games)
177	P177	สนับสนุนการปรับปรุงและบริหารจัดการหนองจอกอารีน่า
178	P178	ทำหมัน ฉีดวัคซีนสัตว์ 250,000 ตัวต่อปี
179	P179	เปิดบริการคลินิกสัตว์สังกัด กทม. ลดค่าใช้จ่ายให้ประชาชน
180	P180	สนับสนุนการรับเลี้ยงสัตว์จรอย่างต่อเนื่อง
181	P181	ส่งเสริมพื้นที่ Pet Friendly ในเมือง (กยส.)
182	P182	ควบคุมการเพาะพันธุ์และจำหน่ายสัตว์เลี้ยงด้วยระบบไมโครชิป
183	P183	ยกระดับและเพิ่มความถี่การตรวจสวัสดิภาพสัตว์ในฟาร์มและร้านค้า
184	P184	ยกระดับมาตรฐานความปลอดภัยของอาคาร เพื่อควบคุมและช่วยเหลือได้รวดเร็วเมื่อเผชิญเหตุ
185	P185	พัฒนาฐานข้อมูลด้านความปลอดภัยภายใน อาคารเข้าสู่ฐานข้อมูลความปลอดภัยของเมือง
186	P186	ฝึกซ้อมเผชิญเหตุร่วมระหว่างอาคาร ขนส่งสาธารณะ และ กทม.
187	P187	เพิ่มสถานีดับเพลิง และขยายการติดตั้งอุปกรณ์ดับเพลิงให้ครอบคลุมมากขึ้น
188	P188	ยกระดับการเตือนภัยและกำหนดข้อบ่งชี้ในการอพยพ
189	P189	นำนวัตกรรมมาใช้เพื่อเพิ่มประสิทธิภาพการดับเพลิง
190	P190	จัดตั้งระบบการบริหารทรัพยากรกลางในการเผชิญเหตุ
191	P191	พัฒนาและยกระดับทีมสหวิชาชีพในการเข้าให้ความช่วยเหลือและฟื้นฟูเบื้องต้น
192	P192	ปรับเงินเยียวยาให้สอดคล้องกับค่าครองชีพ
193	P193	เพิ่มความแม่นยำระบบพยากรณ์ฝน
194	P194	พัฒนาระบบติดตามน้ำเหนือ-น้ำหนุน บูรณาการ ร่วมกับหน่วยงานอื่น เตือนภัยล่วงหน้าได้เร็วขึ้น
195	P195	อุดรอยรั่วตามแม่น้ำเจ้าพระยาให้ครบ
196	P196	ผลักดันการศึกษาแนวทางแก้ไขน้ำทะเลหนุนบริเวณปากแม่น้ำเจ้าพระยา
197	P197	พัฒนาฝายเพื่อนำน้ำมาใช้ในการเกษตรช่วงหน้าแล้ง และกักเก็บน้ำในหน้าฝน
198	P198	ขยายการดูแลจุดเสี่ยงน้ำท่วมเข้าสู่พื้นที่เอกชนที่เปิดให้สาธารณะใช้ประโยชน์
199	P199	ใช้เทคโนโลยีสร้างโมเดลจำลองเพื่อบริหารจัดการน้ำได้อย่างมีประสิทธิภาพ
200	P200	เร่งรัดผลักดันอุโมงค์ระบายน้ำประเวศ แก้ปัญหาน้ำท่วมกรุงเทพตะวันออก
201	P201	เพิ่มศักยภาพคลองสายหลักให้รับน้ำและระบายน้ำได้อย่างเต็มประสิทธิภาพ
202	P202	จำลองสถานการณ์น้ำท่วมจากน้ำฝนและน้ำหนุน เพื่อวางแผนรับมือระยะยาว
203	P203	เพิ่มเครือข่าย CCTV และเชื่อมฐานข้อมูลความปลอดภัยของตำรวจ
204	P204	ตรวจสอบแก้ไขไฟส่องสว่างเปลี่ยน LED ในจุดมืดอีก 100,000 ดวง
205	P205	เทศกิจลาดตระเวนในพื้นที่สำคัญ
206	P206	ยกระดับความปลอดภัยของเมืองเพื่อรองรับการท่องเที่ยว
207	P207	กำหนดมาตรฐาน ‘หลังคาสามสี’ส่งเสริมสวนบนอาคารและใช้สีที่ลดการเก็บความร้อน
208	P208	ปรับมาตรการเพิ่มการซึมผ่านของลม และลดความเข้มข้นของความร้อนในเมือง
209	P209	ขยายห้องหลบร้อนอย่างน้อย 500 แห่ง
210	P210	ส่งเสริมชุมชนสู้ภัยร้อน
211	P211	Next Learn แพลตฟอร์มอัปสกิลสู่โอกาส อาชีพแห่งอนาคต เรียนจบพร้อมทำงาน
212	P212	ปรับหลักสูตรฝึกอาชีพให้ทันสมัย ใช้ทำงานได้จริง เปิดสอนนอกเวลา
213	P213	สร้างเครดิตให้กับธุรกิจฐานรากด้วยข้อมูล และจัดหา แหล่งเงินทุนสำหรับธุรกิจรายย่อยร่วมกับสถาบันการเงิน
214	P214	เปิด Incubation Hub พื้นที่พร้อมอุปกรณ์ให้ทดลองทำธุรกิจ
215	P215	พัฒนาแพลตฟอร์มแบ่งปันข้อมูลและผลการวิเคราะห์เพื่อต่อยอดธุรกิจ
216	P216	ส่งเสริมให้ธุรกิจเพื่อสังคมเป็นกลไกขับเคลื่อนเมือง
217	P217	กระจายศูนย์อิ่มท้องอย่างน้อย 50 แห่งทั่วกรุงเทพฯ
218	P218	เพิ่มพื้นที่ค้าขาย เพิ่มโอกาสทางเศรษฐกิจให้รายย่อย
219	P219	ร่วมมือกับหน่วยงานที่เกี่ยวข้องดึงดูดบรรษัทข้ามชาติ (MNC) มาลงทุน
220	P220	Friends of Bangkok เครือข่ายเพื่อน เมือง ดึงดูดการลงทุนและโอกาสจากทั่วโลก
221	P221	ยกระดับ Invest Bangkok เป็นประตูสู่นานาชาติ
222	P222	ชู 4 เทศกาลให้เป็น World Class Festival ดึงดูดนักท่องเที่ยว
223	P223	ยกระดับเมือง เพื่อรองรับการจัดงานระดับโลก
224	P224	ดึงอัตลักษณ์ สร้างมาตรฐาน ยกระดับเศรษฐกิจ 50 ย่านทั่วกรุงเทพฯ
225	P225	ต่อยอด VisitBangkok สู่แพลตฟอร์มการท่องเที่ยวของเมือง
226	P226	กรุงเทพ Light Up ส่งเสริมการท่องเที่ยวยามค่ำคืนตลอดปี
227	P227	พัฒนาแพลตฟอร์ม Bangkok Creative IP และมาสคอตเมืองกรุงเทพฯ ส่งเสริมเศรษฐกิจจากอัตลักษณ์เมือง
228	P228	ต่อยอดระบบขออนุญาตออนไลน์ให้ครอบคลุมบริการที่หลากหลายขึ้น
229	P229	ปรับกระบวนการลดภาระประชาชนเกี่ยวกับขออนุญาตและรับบริการ
230	P230	BKK Works ยุบรวมทุกแอปพลิเคชันด้านบริการเมืองให้ครบจบในที่เดียว
231	P231	ใช้เทคโนโลยีช่วยพิจารณาการอนุญาตต่างๆ
232	P232	เปิดข้อมูลเมืองในสกุลไฟล์ที่ AI อ่านได้
233	P233	เชื่อมโยงข้อมูลงบประมาณกับพิกัดโครงการ เพื่อ ให้ประชาชนร่วมตรวจสอบงบประมาณได้ง่ายขึ้น
234	P234	ระบบตรวจสอบความเสี่ยงของการจัดซื้อจัด จ้าง ยับยั้งการเซ็นสัญญาเมื่อพบความผิดปกติ
235	P235	พัฒนาระบบติดตามเคสการกระทำความ ผิด เพิ่มความรวดเร็วในการตรวจสอบทุจริต
236	P236	ปรับกฎหมายให้สอดคล้องกับบริบทเมืองใน ปัจจุบัน เพิ่มประสิทธิภาพในการบริหารเมือง
237	P237	ผลักดัน พ.ร.บ. กรุงเทพฯ 2568 ปรับขอบเขตอำนาจของ กทม.
238	P238	ลดความซับซ้อนและระยะเวลาในการดำเนิน งานของระบบราชการ ด้วยระบบราชการดิจิทัล
239	P239	ปรับบทบาทการพาณิชย์ กทม. เน้นประโยชน์ สาธารณะควบคู่กับการสร้างรายได้ให้เมือง
240	P240	แพลตฟอร์มรวมประวัติการซื้อครุภัณฑ์และ วัสดุ เพื่อให้ กทม. จัดซื้อจัดจ้างในราคาที่เหมาะสม
241	P241	จัดเก็บรายได้ให้มีประสิทธิภาพเพื่อพัฒนากรุงเทพฯ
242	P242	ปรับโครงสร้างองค์กร ลดลำดับขั้น ยุบรวมงานที่ซ้ำซ้อน
243	P243	ส่งเสริมบุคลากร กทม. ที่มีศักยภาพสูงให้เติบโตในสายอาชีพ
244	P244	ปรับระบบค่าตอบแทนให้เชื่อมโยงกับเนื้องานที่ทำจริง
245	P245	เดินหน้าเชิงรุกหาปัญหาเมือง ควบคู่กับ Traffy Fondue
246	P246	วิเคราะห์ข้อมูลจากการแจ้งปัญหา ด้วย AI เพื่อยกระดับมาตรฐานการดูแลเมือง
247	P247	ขยายขอบเขตรับเรื่องร้องเรียนให้ครอบคลุมมิติปัญหาเชิงสังคม
248	P248	กำหนดมาตรฐานการแก้ปัญหาในทั้งเชิงปริมาณและคุณภาพ
249	P249	สร้างแพลตฟอร์มให้ประชาชนเสนอไอเดียพัฒนาเมือง
250	P250	ต่อยอด Bangkok City Lab แจกโจทย์เมือง ให้ เครือข่ายร่วมสร้างสรรค์นวัตกรรมเมือง
251	P251	ยกระดับการมีส่วนร่วมของเด็กและเยาวชน ผ่านสภาเด็กและสภาคนรุ่นใหม่
252	P252	ศูนย์กายภาพชุมชน
253	P253	สงครามสู้หนู
254	P254	จัดจุดรอสำหรับไรเดอร์
255	P255	จัดระเบียบหาบเร่แผงลอย
256	P256	ปรับโครงสร้างสอบวินัย
257	P257	ออกแนวทางสำหรับการเขียน TOR ป้องกันการล็อคเสป็ค
258	P258	นำร่องทดลองเพิ่มเส้นทางให้บริการ รถเมล์ ในพื้นที่ที่ขาด
259	P259	อุดหนุนผู้ประกอบการรถเมล์ และ รถหมวด 4 ให้ เพิ่มความถี่และเส้นทางในการให้บริการ
260	P260	จับคู่พื้นที่ ส่งเสริมการทำเกษตรในเมือง
261	P261	ส่งเสริมความรู้และการรับรองวิชาชีพด้านการดูแลเด็ก
\.


--
-- Data for Name: project_attachment_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_attachment_types (doc_type_id, code, doc_type_name) FROM stdin;
1	SYSTEM_DIAGRAM	system_diagram
2	NETWORK_DIAGRAM	network_diagram
3	USE_CASE_DIAGRAM	use_case_diagram
4	SECURITY_DIAGRAM	security_diagram
5	PRESENTATION	presentation
6	REPORT	report
7	EXPENSE_DOCUMENT	ใบเบิกเงิน
8	OTHER	other
9	QUOTATION	quotation
10	ONE_PAGE_SUMMARY	one_page_summary
11	APPROVAL_DOCUMENT	approval_document
12	BMA_DC_USAGE	bma_dc_usage
13	CURRENT_DIAGRAM	current_diagram
\.


--
-- Data for Name: project_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_attachments (id, project_id, doc_type_id, uploaded_by, file_name, file_url, file_type, file_size, description, created_at) FROM stdin;
\.


--
-- Data for Name: project_sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_sequences (year, last_value) FROM stdin;
2569	3
\.


--
-- Data for Name: project_status_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_status_logs (id, project_id, user_id, old_status_id, new_status_id, remark, created_at, source_operation, meeting_id, agenda_id, resolution_id) FROM stdin;
\.


--
-- Data for Name: project_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_statuses (project_status_id, code, project_status_name) FROM stdin;
1	PROJECT_DRAFT	Draft
2	PROJECT_PENDING_SECRETARY	Pending Secretary
3	PROJECT_RETURNED_SECRETARY	Returned by Secretary
4	PROJECT_REJECTED_SECRETARY	Rejected by Secretary
5	PROJECT_PENDING_ASSIGNMENT	Pending Assignment
6	PROJECT_IN_ANALYSIS	In Analysis
7	PROJECT_RETURNED_ANALYST	Returned by Analyst
8	PROJECT_REJECTED_ANALYST	Rejected by Analyst
9	PROJECT_PENDING_SMALL_BOARD	Pending Small Board
10	PROJECT_RETURNED_FROM_SMALL_BOARD	Returned from Small Board
11	PROJECT_REJECTED_BY_SMALL_BOARD	Rejected by Small Board
12	PROJECT_PENDING_BIG_BOARD	Pending Big Board
13	PROJECT_RETURNED_FROM_BIG_BOARD	Returned from Big Board
14	PROJECT_REJECTED_BY_BIG_BOARD	Rejected by Big Board
15	PROJECT_APPROVED	Approved
16	PROJECT_ACKNOWLEDGED	Acknowledged
\.


--
-- Data for Name: project_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_types (project_type_id, code, project_type_name) FROM stdin;
1	HARDWARE	คณะกรรมการพิจารณากลั่นกรองโครงการด้านโครงสร้างพื้นฐานดิจิทัลกรุงเทพมหานคร
2	SOFTWARE	คณะกรรมการพิจารณากลั่นกรองโครงการด้านการพัฒนาระบบสารสนเทศดิจิทัลกรุงเทพมหานคร
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (project_id, project_code, user_id, division_id, project_status_id, project_type_id, four_quadrants_id, deputy_governor_id, initial_requested_budget, latest_requested_budget, external_task_id, project_name, project_name_original, analyst_id, assigned_by, assigned_at, is_public, public_token, created_at, updated_at, updated_by, deleted_at, return_stage, workflow_version, final_approved_budget, initial_estimated_cost, latest_estimated_cost, final_estimated_cost) FROM stdin;
01a18bfa-5783-770c-9b7a-ab785babf450	BMA-69-0002	01a10b32-bf51-7239-832a-c2b765e1ef06	369	1	\N	2	3	\N	0.00	\N	UAT-P2026-103002	UAT-P2026-103002	\N	\N	\N	f	\N	2026-10-30 08:43:21.871034	2026-11-02 06:14:39.437	01a10b32-bf51-7239-832a-c2b765e1ef06	\N	\N	0	\N	\N	0.00	\N
01a18bf7-f30f-740b-9d83-ad8f7f530b9f	BMA-69-0001	01a10b32-bf51-7239-832a-c2b765e1ef06	369	1	\N	1	2	\N	100000.00	\N	UAT-P2026-103001	UAT-P2026-103001	\N	\N	\N	f	\N	2026-10-30 08:40:45.081519	2026-11-03 07:31:43.289	01a10b32-bf51-7239-832a-c2b765e1ef06	\N	\N	0	\N	\N	0.00	\N
01a1d33d-ff7e-70b8-a059-a17d28550f19	BMA-69-0003	019fb671-e5d5-7133-80f7-b82404a5b474	369	1	\N	1	2	\N	\N	\N	UAT-P2026-1113001	UAT-P2026-1113001	\N	\N	\N	f	\N	2026-11-13 04:50:18.144261	2026-11-13 04:50:18.144261	\N	\N	\N	0	\N	\N	\N	\N
\.


--
-- Data for Name: proposal_budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_budgets (id, proposal_id, year, amount, budget_type) FROM stdin;
\.


--
-- Data for Name: proposal_cloud_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_cloud_requests (id, proposal_id, system_name, requested_service_date, recorded_request_date) FROM stdin;
\.


--
-- Data for Name: proposal_cloud_vms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_cloud_vms (id, cloud_request_id, vm_description, os_database, vcpu, ram_gb, gpu_gb, storage_gb, price) FROM stdin;
\.


--
-- Data for Name: proposal_drafts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_drafts (draft_id, project_id, user_id, project_name, objective, requested_budget_total, current_step, draft_payload, created_at, updated_at, updated_by, estimated_cost_total) FROM stdin;
01a18bfb-dd06-7481-a5dc-b89948c0d4b1	01a18bfa-5783-770c-9b7a-ab785babf450	01a10b32-bf51-7239-832a-c2b765e1ef06	UAT-P2026-103002	\N	0.00	1	{"scope": "", "target": "", "isReady": false, "dcioName": "ผู้บริหารเทคโนโลยีสารสนเทศระดับสูง (DCIO)", "manpower": [], "agencyKpi": "", "dataOwner": "", "isBmaPlan": false, "objective": "", "agencyName": "สำนักดิจิทัลกรุงเทพมหานคร - กองยุทธศาสตร์ดิจิทัล", "background": "", "otherCosts": [], "agencyIssue": "", "isInRoadmap": false, "projectName": "UAT-P2026-103002", "projectType": "NEW", "durationDays": 0, "headOfAgency": "หัวหน้าส่วนราชการ", "ictPersonnel": [], "isAgencyPlan": false, "obstacleLaws": "", "budgetsByYear": [{"year": 25556, "amount": 0, "budgetType": "งบประมาณรายจ่ายประจำปี"}], "cloudRequests": [], "hardwareCosts": [], "softwareCosts": [], "agencyStrategy": "", "otherReadiness": "", "projectManager": "ทดสอบ ผู้ใช้งาน", "appArchitecture": "", "currentProblems": "", "relatedProjects": [], "trainingCourses": [], "dataExchangePlan": "", "expectedBenefits": "", "isGovernorPolicy": false, "readinessDetails": "", "existingEquipment": [], "governorPolicyCode": "", "governorPolicyName": "", "personnelAsstCosts": [], "personnelCoreCosts": [], "personnelSuppCosts": [], "currentSystemStatus": "", "personnelResponsibilities": []}	2026-10-30 08:45:01.575423	2026-11-02 06:14:39.432	01a10b32-bf51-7239-832a-c2b765e1ef06	0.00
01a18bf8-784a-71a9-bd9f-d307d79a03f8	01a18bf7-f30f-740b-9d83-ad8f7f530b9f	01a10b32-bf51-7239-832a-c2b765e1ef06	UAT-P2026-103001	\N	100000.00	1	{"scope": "", "target": "", "isReady": false, "dcioName": "ผู้บริหารเทคโนโลยีสารสนเทศระดับสูง (DCIO)", "manpower": [], "agencyKpi": "", "dataOwner": "", "isBmaPlan": false, "objective": "", "agencyName": "สำนักดิจิทัลกรุงเทพมหานคร - กองยุทธศาสตร์ดิจิทัล", "background": "", "otherCosts": [], "agencyIssue": "", "isInRoadmap": false, "projectName": "UAT-P2026-103001", "projectType": "NEW", "durationDays": 0, "headOfAgency": "หัวหน้าส่วนราชการ", "ictPersonnel": [], "isAgencyPlan": false, "obstacleLaws": "", "budgetsByYear": [{"year": 2571, "amount": 100000, "budgetType": "งบประมาณรายจ่ายประจำปี"}], "cloudRequests": [], "hardwareCosts": [], "softwareCosts": [], "agencyStrategy": "", "otherReadiness": "", "projectManager": "ทดสอบ ผู้ใช้งาน", "appArchitecture": "", "currentProblems": "", "relatedProjects": [], "trainingCourses": [], "dataExchangePlan": "", "expectedBenefits": "", "isGovernorPolicy": false, "readinessDetails": "", "existingEquipment": [], "governorPolicyCode": "", "governorPolicyName": "", "personnelAsstCosts": [], "personnelCoreCosts": [], "personnelSuppCosts": [], "currentSystemStatus": "", "personnelResponsibilities": []}	2026-10-30 08:41:19.180051	2026-11-03 07:31:43.284	01a10b32-bf51-7239-832a-c2b765e1ef06	0.00
\.


--
-- Data for Name: proposal_existing_equipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_existing_equipments (id, proposal_id, item_name, age_years, quantity, user_name, location, remark) FROM stdin;
\.


--
-- Data for Name: proposal_hardware_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_hardware_costs (id, proposal_id, item_name, quantity, unit_price, reference_type, mdes_month, mdes_year, mdes_item_no, market_count, market_company, prev_project, prev_year, other_detail) FROM stdin;
\.


--
-- Data for Name: proposal_ict_personnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_ict_personnel (id, proposal_id, "position", level, count) FROM stdin;
\.


--
-- Data for Name: proposal_manpower; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_manpower (id, proposal_id, agency_part, position_limit, occupied, vacant) FROM stdin;
\.


--
-- Data for Name: proposal_other_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_other_costs (id, proposal_id, item_name, quantity, unit_price, remark, cost_type) FROM stdin;
\.


--
-- Data for Name: proposal_personnel_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_personnel_costs (id, proposal_id, personnel_type, "position", degree, field_of_study, experience_years, base_salary, multiplier, person_count, duration_months) FROM stdin;
\.


--
-- Data for Name: proposal_personnel_responsibilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_personnel_responsibilities (id, proposal_id, "position", responsibility) FROM stdin;
\.


--
-- Data for Name: proposal_related_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_related_projects (id, proposal_id, project_name, agency, fiscal_year, relation_type, remark) FROM stdin;
\.


--
-- Data for Name: proposal_software_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_software_costs (id, proposal_id, item_name, quantity, unit_price, reference_type, mdes_month, mdes_year, mdes_item_no, market_count, market_company, prev_project, prev_year, other_detail) FROM stdin;
\.


--
-- Data for Name: proposal_training_food_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_training_food_costs (id, training_id, item_name, meals_count, rate_per_meal, trainees_count, days) FROM stdin;
\.


--
-- Data for Name: proposal_training_speaker_costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_training_speaker_costs (id, training_id, item_name, hours, rate_per_hour, days) FROM stdin;
\.


--
-- Data for Name: proposal_trainings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_trainings (id, proposal_id, course_name, training_method, location_type, has_speaker_cost, speaker_reason) FROM stdin;
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposals (id, status, project_id, user_id, updated_by, version, project_name, agency_name, head_of_agency, dcio_name, project_manager, requested_budget_total, background, objective, target, scope, project_type, current_system_status, current_problems, is_bma_plan, is_agency_plan, agency_strategy, agency_issue, agency_kpi, is_governor_policy, governor_policy_code, governor_policy_name, obstacle_laws, app_architecture, data_owner, data_exchange_plan, is_ready, readiness_details, duration_days, other_readiness, expected_benefits, is_in_roadmap, created_at, updated_at, estimated_cost_total, submitted_at, department_id, division_id, project_ever_passed, prev_presented_year, prev_project_name_mode, prev_presented_project, prev_resolution, bma_plan_strategy, bma_plan_issue, bma_plan_kpi) FROM stdin;
\.


--
-- Data for Name: resolution_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resolution_statuses (id, name, code) FROM stdin;
1	Approved	APPROVED
2	Conditional Approval	CONDITIONAL_APPROVAL
3	Not Approved	NOT_APPROVED
4	Acknowledged	ACKNOWLEDGED
5	Pending (Legacy)	PENDING_LEGACY
6	Reconsider	RECONSIDER
7	Not Considered	NOT_CONSIDERED
\.


--
-- Data for Name: resolutions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resolutions (id, agenda_id, resolution_status_id, comment, recorded_by, created_at, updated_at, resolution_type, remark, resolved_at, version, governed_proposal_id) FROM stdin;
\.


--
-- Data for Name: role_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_user (user_id, role_id, assigned_by, assigned_at) FROM stdin;
019fb671-e5d5-7133-80f7-b82404a5b474	5	019fb671-e5d5-7133-80f7-b82404a5b474	2026-07-31 04:33:43.835483
019fb671-e5d5-7133-80f7-b82404a5b474	4	019fb671-e5d5-7133-80f7-b82404a5b474	2026-07-31 04:33:43.835483
019fb671-e5d5-7133-80f7-b82404a5b474	2	019fb671-e5d5-7133-80f7-b82404a5b474	2026-07-31 04:33:43.835483
019fb671-e5d5-7133-80f7-b82404a5b474	3	019fb671-e5d5-7133-80f7-b82404a5b474	2026-07-31 04:33:43.835483
019fb671-e5d5-7133-80f7-b82404a5b474	1	019fb671-e5d5-7133-80f7-b82404a5b474	2026-07-31 04:33:43.835483
01a10b3c-1f88-74ce-89bb-2ee7ffcea3c8	2	019fb671-e5d5-7133-80f7-b82404a5b474	2026-10-05 08:46:17.959784
01a10b32-bf51-7239-832a-c2b765e1ef06	1	019fb671-e5d5-7133-80f7-b82404a5b474	2026-10-05 08:46:34.929233
01a10b3d-043d-750d-b06d-d716f3417a2b	4	019fb671-e5d5-7133-80f7-b82404a5b474	2026-10-05 08:46:42.801176
01a180cd-6074-71de-b93e-1c203fae521c	3	019fb671-e5d5-7133-80f7-b82404a5b474	2026-10-28 04:39:14.431784
01a18ba6-70df-73de-8ed2-0bc47048c4d6	1	\N	2026-10-30 07:11:43.32361
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, code, role_name, description) FROM stdin;
1	USER	USER	\N
2	ANALYST	ANALYST	\N
3	SECRETARY	SECRETARY	\N
4	ADMIN	ADMIN	\N
5	SUPER_ADMIN	SUPER_ADMIN	\N
\.


--
-- Data for Name: user_login_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_login_history (id, user_id, ip_address, user_agent, login_at) FROM stdin;
826d7bcb-afd9-46d7-af6b-b0a1d54d60d3	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-10-05 08:32:34.458741
843e10f9-5cb1-4ac9-98fb-8a8499e9b9fc	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-10-05 08:45:32.987673
71e7e5ce-f427-4fec-9b55-e2be40557247	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-10-06 08:51:18.123222
ce88643e-b1f9-4ba7-bcd2-60dd0c3e7815	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.140.0 Chrome/150.0.7871.250 Electron/43.7.3 Safari/537.36	2026-10-07 07:20:46.205459
585f12e0-fb33-44ae-bba6-50b9e3c4a84b	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.140.0 Chrome/150.0.7871.250 Electron/43.7.3 Safari/537.36	2026-10-07 07:20:47.592334
85812574-a086-47ff-b99e-444a45c4cdd6	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-10-14 07:47:32.029826
5c1b2113-4c96-4257-883e-965827143a68	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-10-14 07:59:42.857936
ffee6e1e-0258-4dc7-b76c-e959658118ae	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-10-28 04:30:03.226434
0de291f3-2c4c-4678-b709-f5abbb3f24d6	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-10-28 04:31:22.294945
88ef2b68-2ff1-4431-a53e-3d93b21b268d	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-10-28 04:39:46.654292
b2915509-7bcd-4705-ac30-bbc48b2cf074	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	curl/8.5.0	2026-10-28 15:05:48.704765
2e534b20-d972-4952-9104-48d2810b29e4	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	curl/8.5.0	2026-10-28 15:10:43.420075
95be35a6-1e9c-4878-acc3-fdaf827b0234	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	curl/8.5.0	2026-10-28 15:18:48.710286
2fdb8779-1d18-4125-b2de-40de7fad735e	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	curl/8.5.0	2026-10-28 15:32:18.75501
2149412a-2fcc-43df-9804-9fb6af509df8	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-10-30 02:39:40.725039
5be8d627-69ea-4732-b7ca-84921ad51fd5	01a180cd-6074-71de-b93e-1c203fae521c	unknown	node	2026-10-30 02:42:26.210633
1f79766b-69c0-4c3a-8cd5-a02fd75c0009	01a10b3d-043d-750d-b06d-d716f3417a2b	unknown	node	2026-10-30 02:42:53.784531
d76d32eb-e650-4f40-b6b5-a2cd850b6ac7	01a10b3c-1f88-74ce-89bb-2ee7ffcea3c8	unknown	node	2026-10-30 02:43:07.837072
1674c830-3d6a-42ec-9413-b214e8ec757b	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	curl/8.5.0	2026-10-30 02:59:06.99704
7dbf068b-97e0-4557-a5dc-7e96105bb103	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	curl/8.5.0	2026-10-30 02:59:14.222599
243147a2-c4d4-4ba3-b0f4-d74ccf05f1ab	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-10-30 03:00:27.223852
8b164347-2aac-44c0-967a-09e5ec6eaf10	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-10-30 04:06:35.183968
1520650c-ade3-4e63-a28a-60142300d55f	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-10-30 08:36:55.725687
cb1195f7-74dd-43e5-a8d0-ce6232556cab	01a18ba6-70df-73de-8ed2-0bc47048c4d6	unknown	node	2026-11-02 02:00:04.340427
9b92ce94-e392-4884-a9cf-c53c0af74cfe	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-11-02 02:00:40.37284
705f966d-5644-48c1-90c4-ba6c71613129	01a10b3d-043d-750d-b06d-d716f3417a2b	unknown	node	2026-11-02 06:42:38.210901
89df175d-2d47-4504-936b-719f42962844	01a180cd-6074-71de-b93e-1c203fae521c	unknown	node	2026-11-02 06:46:10.235119
2b82fdbf-0ea5-475b-9655-9460819ce19e	01a10b32-bf51-7239-832a-c2b765e1ef06	unknown	node	2026-11-02 06:51:27.689434
be117b2c-dfcf-4a3a-ad5e-0ac7e0a03ad2	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-11-13 03:58:10.111261
0674d6a4-60c9-4732-86a5-495ce4a6a09f	019fb671-e5d5-7133-80f7-b82404a5b474	unknown	node	2026-11-15 15:26:00.407094
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, first_name, last_name, email, "position", level, management_position, division_id, mobile_phone, office_phone, internal_extension, is_active, reset_password_token, reset_password_expires, is_verified, verification_token, verification_expires, created_at, updated_at) FROM stdin;
019fb671-e5d5-7133-80f7-b82404a5b474	SUPER_ADMIN	$argon2id$v=19$m=65536,t=2,p=1$ZfAfPvHAFUdo7c8Yfdk18efM4r12GPdfxC3OvWjX4MA$zAa5trPDWNwAEQ3ULfg85S826HmCQhOaP5Y88uP9xs8	Super	Admin	bma.dsdstrategy@gmail.com	\N	\N	\N	369	\N	\N	\N	t	\N	\N	t	\N	\N	2026-07-31 04:32:25.548666	2026-07-31 04:32:25.548666
01a10b3c-1f88-74ce-89bb-2ee7ffcea3c8	analysis-test	$argon2id$v=19$m=65536,t=2,p=1$w+QdGP/OiOIgoLOtvRn5FRUL+CF1RqG/670HXSel9gs$SZigxwimB47yTB40op7CdCWBvYnn2pTd6JAQ+Q+QUKQ	ทดสอบ	ผู้วิเคราะห์	analysis@test-bangkok.go.th	นักวิชาการคอมพิวเตอร์	ชำนาญการ	\N	369	0812345678	022251535	1530	t	\N	\N	t	\N	\N	2026-10-05 08:44:12.039855	2026-10-05 08:45:41.883
01a10b3d-043d-750d-b06d-d716f3417a2b	admin-test	$argon2id$v=19$m=65536,t=2,p=1$UCHM5wE4reGyjyO/nOc3dbdA9L9Mz4b3YKl2sjyRjeY$bBdixbtWrkqt5ZY492/GAtAOqohG5RhIzWp04K26IIU	ทดสอบ	ผู้ดูแล คกก	admin@test-bangkok.go.th	นักวิชาการคอมพิวเตอร์	ชำนาญการพิเศษ	หัวหน้ากลุ่มงานยุทธศาสตร์ดิจิทัล	369	0812345678	022251535	1530	t	\N	\N	t	\N	\N	2026-10-05 08:45:10.588452	2026-10-06 09:17:09.443
01a180cd-6074-71de-b93e-1c203fae521c	secretary-test	$argon2id$v=19$m=65536,t=2,p=1$P9E09lXArr3yAiVuyzUucAQGXDrqp9Dpu0H0oyJRhHo$rn7C1La9rSb5U2FhAqXByWOq5WhYv9f+5O5ZnwoclOg	ทดสอบ	เลขานุการ คกก	secretary@test-bangkok.go.th	นักวิชาการคอมพิวเตอร์	ชำนาญการ		369	0812345678	022251535	1530	t	\N	\N	t	\N	\N	2026-10-28 04:38:25.650413	2026-10-28 04:38:49.377
01a10b32-bf51-7239-832a-c2b765e1ef06	user-test	$argon2id$v=19$m=65536,t=2,p=1$uS5L7nLwcMgjH4bBSmf3VSR5/tdIvM0L711JtL8KYUM$EodrOolJs3oy9eD95J6U9pZcjLazwLZUUsPZIZJjvpk	ทดสอบ	ผู้ใช้งาน	user@test-bangkok.go.th	นักจัดการงานทั่วไป	ชำนาญการพิเศษ	\N	369	0812345678	022251535	1530	t	\N	\N	t	\N	\N	2026-10-05 08:33:57.584022	2026-10-30 02:59:01.448
01a18ba6-70df-73de-8ed2-0bc47048c4d6	pisitpon	$argon2id$v=19$m=65536,t=2,p=1$6X4mfRigGGxMIkSf4pDsy4k/2khL58U+usOu74wRBZ4$iKUGYjgOs9h3TUWjAzBv/Ssmlpwtd4bPaxE02GAEIXA	พิสิฐพล	ณิทธิมนพันธุ์	pisitpon@bangkok.go.th	นักวิชาการคอมพิวเตอร์	ชำนาญการ		369	0897371193	022251535	1530	t	df1417ab886a43257cc9cb01b5375a94dc52bae97893e2a699a879c8faca9b6f	2026-10-30 08:04:32.599	t	\N	\N	2026-10-30 07:11:43.32361	2026-10-30 07:34:32.6
\.


--
-- Data for Name: workflow_audit_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_audit_events (id, actor_id, action, entity_type, entity_id, reason, metadata, created_at) FROM stdin;
\.


--
-- Name: agenda_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agenda_types_id_seq', 1, false);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 79, true);


--
-- Name: deputy_governors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deputy_governors_id_seq', 1, false);


--
-- Name: divisions_division_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.divisions_division_id_seq', 371, true);


--
-- Name: four_quadrants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.four_quadrants_id_seq', 1, false);


--
-- Name: meeting_attachment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meeting_attachment_types_id_seq', 1, false);


--
-- Name: meeting_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meeting_statuses_id_seq', 5, true);


--
-- Name: meeting_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meeting_types_id_seq', 1, false);


--
-- Name: policy_governor_policy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.policy_governor_policy_id_seq', 522, true);


--
-- Name: project_attachment_types_doc_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_attachment_types_doc_type_id_seq', 13, true);


--
-- Name: project_statuses_project_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_statuses_project_status_id_seq', 16, true);


--
-- Name: project_types_project_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_types_project_type_id_seq', 1, false);


--
-- Name: resolution_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resolution_statuses_id_seq', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 1, false);


--
-- Name: agenda_types agenda_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda_types
    ADD CONSTRAINT agenda_types_code_unique UNIQUE (code);


--
-- Name: agenda_types agenda_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda_types
    ADD CONSTRAINT agenda_types_name_unique UNIQUE (name);


--
-- Name: agenda_types agenda_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda_types
    ADD CONSTRAINT agenda_types_pkey PRIMARY KEY (id);


--
-- Name: agendas agendas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_pkey PRIMARY KEY (id);


--
-- Name: departments departments_department_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_code_unique UNIQUE (department_code);


--
-- Name: departments departments_department_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_name_unique UNIQUE (department_name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: deputy_governors deputy_governors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deputy_governors
    ADD CONSTRAINT deputy_governors_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_division_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_division_code_unique UNIQUE (division_code);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (division_id);


--
-- Name: four_quadrants four_quadrants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.four_quadrants
    ADD CONSTRAINT four_quadrants_pkey PRIMARY KEY (id);


--
-- Name: meeting_attachment_types meeting_attachment_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachment_types
    ADD CONSTRAINT meeting_attachment_types_code_unique UNIQUE (code);


--
-- Name: meeting_attachment_types meeting_attachment_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachment_types
    ADD CONSTRAINT meeting_attachment_types_name_unique UNIQUE (name);


--
-- Name: meeting_attachment_types meeting_attachment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachment_types
    ADD CONSTRAINT meeting_attachment_types_pkey PRIMARY KEY (id);


--
-- Name: meeting_attachments meeting_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_pkey PRIMARY KEY (id);


--
-- Name: meeting_resolution_revisions meeting_resolution_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_pkey PRIMARY KEY (id);


--
-- Name: meeting_statuses meeting_statuses_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_statuses
    ADD CONSTRAINT meeting_statuses_code_unique UNIQUE (code);


--
-- Name: meeting_statuses meeting_statuses_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_statuses
    ADD CONSTRAINT meeting_statuses_name_unique UNIQUE (name);


--
-- Name: meeting_statuses meeting_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_statuses
    ADD CONSTRAINT meeting_statuses_pkey PRIMARY KEY (id);


--
-- Name: meeting_types meeting_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_types
    ADD CONSTRAINT meeting_types_code_unique UNIQUE (code);


--
-- Name: meeting_types meeting_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_types
    ADD CONSTRAINT meeting_types_name_unique UNIQUE (name);


--
-- Name: meeting_types meeting_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_types
    ADD CONSTRAINT meeting_types_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: policy_governor policy_governor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_governor
    ADD CONSTRAINT policy_governor_pkey PRIMARY KEY (policy_id);


--
-- Name: policy_governor policy_governor_policy_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_governor
    ADD CONSTRAINT policy_governor_policy_code_unique UNIQUE (policy_code);


--
-- Name: project_attachment_types project_attachment_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachment_types
    ADD CONSTRAINT project_attachment_types_code_unique UNIQUE (code);


--
-- Name: project_attachment_types project_attachment_types_doc_type_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachment_types
    ADD CONSTRAINT project_attachment_types_doc_type_name_unique UNIQUE (doc_type_name);


--
-- Name: project_attachment_types project_attachment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachment_types
    ADD CONSTRAINT project_attachment_types_pkey PRIMARY KEY (doc_type_id);


--
-- Name: project_attachments project_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_pkey PRIMARY KEY (id);


--
-- Name: project_sequences project_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_sequences
    ADD CONSTRAINT project_sequences_pkey PRIMARY KEY (year);


--
-- Name: project_status_logs project_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_pkey PRIMARY KEY (id);


--
-- Name: project_statuses project_statuses_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_code_unique UNIQUE (code);


--
-- Name: project_statuses project_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (project_status_id);


--
-- Name: project_statuses project_statuses_project_status_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_project_status_name_unique UNIQUE (project_status_name);


--
-- Name: project_types project_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_code_unique UNIQUE (code);


--
-- Name: project_types project_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_pkey PRIMARY KEY (project_type_id);


--
-- Name: project_types project_types_project_type_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_project_type_name_unique UNIQUE (project_type_name);


--
-- Name: projects projects_external_task_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_external_task_id_unique UNIQUE (external_task_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: projects projects_project_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_code_unique UNIQUE (project_code);


--
-- Name: projects projects_public_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_public_token_unique UNIQUE (public_token);


--
-- Name: proposal_budgets proposal_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_budgets
    ADD CONSTRAINT proposal_budgets_pkey PRIMARY KEY (id);


--
-- Name: proposal_cloud_requests proposal_cloud_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_cloud_requests
    ADD CONSTRAINT proposal_cloud_requests_pkey PRIMARY KEY (id);


--
-- Name: proposal_cloud_vms proposal_cloud_vms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_cloud_vms
    ADD CONSTRAINT proposal_cloud_vms_pkey PRIMARY KEY (id);


--
-- Name: proposal_drafts proposal_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_pkey PRIMARY KEY (draft_id);


--
-- Name: proposal_drafts proposal_drafts_project_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_project_id_unique UNIQUE (project_id);


--
-- Name: proposal_existing_equipments proposal_existing_equipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_existing_equipments
    ADD CONSTRAINT proposal_existing_equipments_pkey PRIMARY KEY (id);


--
-- Name: proposal_hardware_costs proposal_hardware_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_hardware_costs
    ADD CONSTRAINT proposal_hardware_costs_pkey PRIMARY KEY (id);


--
-- Name: proposal_ict_personnel proposal_ict_personnel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_ict_personnel
    ADD CONSTRAINT proposal_ict_personnel_pkey PRIMARY KEY (id);


--
-- Name: proposal_manpower proposal_manpower_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_manpower
    ADD CONSTRAINT proposal_manpower_pkey PRIMARY KEY (id);


--
-- Name: proposal_other_costs proposal_other_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_other_costs
    ADD CONSTRAINT proposal_other_costs_pkey PRIMARY KEY (id);


--
-- Name: proposal_personnel_costs proposal_personnel_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_personnel_costs
    ADD CONSTRAINT proposal_personnel_costs_pkey PRIMARY KEY (id);


--
-- Name: proposal_personnel_responsibilities proposal_personnel_responsibilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_personnel_responsibilities
    ADD CONSTRAINT proposal_personnel_responsibilities_pkey PRIMARY KEY (id);


--
-- Name: proposal_related_projects proposal_related_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_related_projects
    ADD CONSTRAINT proposal_related_projects_pkey PRIMARY KEY (id);


--
-- Name: proposal_software_costs proposal_software_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_software_costs
    ADD CONSTRAINT proposal_software_costs_pkey PRIMARY KEY (id);


--
-- Name: proposal_training_food_costs proposal_training_food_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_training_food_costs
    ADD CONSTRAINT proposal_training_food_costs_pkey PRIMARY KEY (id);


--
-- Name: proposal_training_speaker_costs proposal_training_speaker_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_training_speaker_costs
    ADD CONSTRAINT proposal_training_speaker_costs_pkey PRIMARY KEY (id);


--
-- Name: proposal_trainings proposal_trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_trainings
    ADD CONSTRAINT proposal_trainings_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: resolution_statuses resolution_statuses_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolution_statuses
    ADD CONSTRAINT resolution_statuses_code_unique UNIQUE (code);


--
-- Name: resolution_statuses resolution_statuses_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolution_statuses
    ADD CONSTRAINT resolution_statuses_name_unique UNIQUE (name);


--
-- Name: resolution_statuses resolution_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolution_statuses
    ADD CONSTRAINT resolution_statuses_pkey PRIMARY KEY (id);


--
-- Name: resolutions resolutions_agenda_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_agenda_id_unique UNIQUE (agenda_id);


--
-- Name: resolutions resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_pkey PRIMARY KEY (id);


--
-- Name: role_user role_user_user_id_role_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_role_id_pk PRIMARY KEY (user_id, role_id);


--
-- Name: roles roles_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_unique UNIQUE (code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_unique UNIQUE (role_name);


--
-- Name: user_login_history user_login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_login_history
    ADD CONSTRAINT user_login_history_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_reset_password_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_reset_password_token_unique UNIQUE (reset_password_token);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: users users_verification_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_verification_token_unique UNIQUE (verification_token);


--
-- Name: workflow_audit_events workflow_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_audit_events
    ADD CONSTRAINT workflow_audit_events_pkey PRIMARY KEY (id);


--
-- Name: agendas_meeting_project_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX agendas_meeting_project_idx ON public.agendas USING btree (meeting_id, project_id) WHERE (project_id IS NOT NULL);


--
-- Name: agendas_meeting_sort_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX agendas_meeting_sort_order_idx ON public.agendas USING btree (meeting_id, sort_order);


--
-- Name: agendas_project_meeting_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX agendas_project_meeting_idx ON public.agendas USING btree (project_id, meeting_id);


--
-- Name: departments_department_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX departments_department_code_idx ON public.departments USING btree (department_code);


--
-- Name: divisions_department_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX divisions_department_id_idx ON public.divisions USING btree (department_id);


--
-- Name: divisions_division_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX divisions_division_code_idx ON public.divisions USING btree (division_code);


--
-- Name: meeting_attachments_meeting_document_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meeting_attachments_meeting_document_idx ON public.meeting_attachments USING btree (meeting_id, document_type);


--
-- Name: meeting_resolution_revisions_project_changed_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meeting_resolution_revisions_project_changed_idx ON public.meeting_resolution_revisions USING btree (project_id, changed_at);


--
-- Name: meeting_resolution_revisions_project_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meeting_resolution_revisions_project_idx ON public.meeting_resolution_revisions USING btree (project_id, changed_at);


--
-- Name: meeting_resolution_revisions_resolution_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meeting_resolution_revisions_resolution_idx ON public.meeting_resolution_revisions USING btree (resolution_id, revision_number);


--
-- Name: meetings_workflow_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meetings_workflow_idx ON public.meetings USING btree (meeting_type_id, meeting_status_id, meeting_date);


--
-- Name: project_status_logs_meeting_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX project_status_logs_meeting_idx ON public.project_status_logs USING btree (meeting_id, agenda_id, resolution_id);


--
-- Name: project_status_logs_project_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX project_status_logs_project_status_idx ON public.project_status_logs USING btree (project_id, new_status_id);


--
-- Name: projects_analyst_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX projects_analyst_status_idx ON public.projects USING btree (analyst_id, project_status_id);


--
-- Name: projects_status_budget_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX projects_status_budget_idx ON public.projects USING btree (project_status_id, latest_requested_budget);


--
-- Name: proposals_project_status_submitted_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proposals_project_status_submitted_idx ON public.proposals USING btree (project_id, status, submitted_at, id);


--
-- Name: resolutions_agenda_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resolutions_agenda_idx ON public.resolutions USING btree (agenda_id);


--
-- Name: resolutions_governed_proposal_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resolutions_governed_proposal_idx ON public.resolutions USING btree (governed_proposal_id);


--
-- Name: workflow_audit_events_actor_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX workflow_audit_events_actor_idx ON public.workflow_audit_events USING btree (actor_id, created_at);


--
-- Name: workflow_audit_events_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX workflow_audit_events_entity_idx ON public.workflow_audit_events USING btree (entity_type, entity_id, created_at);


--
-- Name: agendas agendas_agenda_type_id_agenda_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_agenda_type_id_agenda_types_id_fk FOREIGN KEY (agenda_type_id) REFERENCES public.agenda_types(id);


--
-- Name: agendas agendas_meeting_id_meetings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_meeting_id_meetings_id_fk FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- Name: agendas agendas_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendas
    ADD CONSTRAINT agendas_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: divisions divisions_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: meeting_attachments meeting_attachments_agenda_id_agendas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_agenda_id_agendas_id_fk FOREIGN KEY (agenda_id) REFERENCES public.agendas(id) ON DELETE CASCADE;


--
-- Name: meeting_attachments meeting_attachments_meeting_doc_type_id_meeting_attachment_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_meeting_doc_type_id_meeting_attachment_type FOREIGN KEY (meeting_doc_type_id) REFERENCES public.meeting_attachment_types(id);


--
-- Name: meeting_attachments meeting_attachments_meeting_id_meetings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_meeting_id_meetings_id_fk FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- Name: meeting_attachments meeting_attachments_uploaded_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_attachments
    ADD CONSTRAINT meeting_attachments_uploaded_by_users_user_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id);


--
-- Name: meeting_resolution_revisions meeting_resolution_revisions_changed_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_changed_by_users_user_id_fk FOREIGN KEY (changed_by) REFERENCES public.users(user_id);


--
-- Name: meeting_resolution_revisions meeting_resolution_revisions_new_project_status_id_project_stat; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_new_project_status_id_project_stat FOREIGN KEY (new_project_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- Name: meeting_resolution_revisions meeting_resolution_revisions_previous_project_status_id_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_previous_project_status_id_project FOREIGN KEY (previous_project_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- Name: meeting_resolution_revisions meeting_resolution_revisions_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: meeting_resolution_revisions meeting_resolution_revisions_resolution_id_resolutions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_resolution_revisions
    ADD CONSTRAINT meeting_resolution_revisions_resolution_id_resolutions_id_fk FOREIGN KEY (resolution_id) REFERENCES public.resolutions(id) ON DELETE CASCADE;


--
-- Name: meetings meetings_created_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_created_by_users_user_id_fk FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: meetings meetings_meeting_status_id_meeting_statuses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_meeting_status_id_meeting_statuses_id_fk FOREIGN KEY (meeting_status_id) REFERENCES public.meeting_statuses(id);


--
-- Name: meetings meetings_meeting_type_id_meeting_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_meeting_type_id_meeting_types_id_fk FOREIGN KEY (meeting_type_id) REFERENCES public.meeting_types(id);


--
-- Name: meetings meetings_updated_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_updated_by_users_user_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(user_id);


--
-- Name: project_attachments project_attachments_doc_type_id_project_attachment_types_doc_ty; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_doc_type_id_project_attachment_types_doc_ty FOREIGN KEY (doc_type_id) REFERENCES public.project_attachment_types(doc_type_id);


--
-- Name: project_attachments project_attachments_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_attachments project_attachments_uploaded_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_uploaded_by_users_user_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id);


--
-- Name: project_status_logs project_status_logs_agenda_id_agendas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_agenda_id_agendas_id_fk FOREIGN KEY (agenda_id) REFERENCES public.agendas(id);


--
-- Name: project_status_logs project_status_logs_meeting_id_meetings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_meeting_id_meetings_id_fk FOREIGN KEY (meeting_id) REFERENCES public.meetings(id);


--
-- Name: project_status_logs project_status_logs_new_status_id_project_statuses_project_stat; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_new_status_id_project_statuses_project_stat FOREIGN KEY (new_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- Name: project_status_logs project_status_logs_old_status_id_project_statuses_project_stat; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_old_status_id_project_statuses_project_stat FOREIGN KEY (old_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- Name: project_status_logs project_status_logs_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_status_logs project_status_logs_resolution_id_resolutions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_resolution_id_resolutions_id_fk FOREIGN KEY (resolution_id) REFERENCES public.resolutions(id);


--
-- Name: project_status_logs project_status_logs_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_status_logs
    ADD CONSTRAINT project_status_logs_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: projects projects_deputy_governor_id_deputy_governors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_deputy_governor_id_deputy_governors_id_fk FOREIGN KEY (deputy_governor_id) REFERENCES public.deputy_governors(id);


--
-- Name: projects projects_division_id_divisions_division_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_division_id_divisions_division_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(division_id);


--
-- Name: projects projects_four_quadrants_id_four_quadrants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_four_quadrants_id_four_quadrants_id_fk FOREIGN KEY (four_quadrants_id) REFERENCES public.four_quadrants(id);


--
-- Name: projects projects_project_status_id_project_statuses_project_status_id_f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_status_id_project_statuses_project_status_id_f FOREIGN KEY (project_status_id) REFERENCES public.project_statuses(project_status_id);


--
-- Name: projects projects_project_type_id_project_types_project_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_type_id_project_types_project_type_id_fk FOREIGN KEY (project_type_id) REFERENCES public.project_types(project_type_id);


--
-- Name: projects projects_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: proposal_budgets proposal_budgets_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_budgets
    ADD CONSTRAINT proposal_budgets_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_cloud_requests proposal_cloud_requests_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_cloud_requests
    ADD CONSTRAINT proposal_cloud_requests_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_cloud_vms proposal_cloud_vms_cloud_request_id_proposal_cloud_requests_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_cloud_vms
    ADD CONSTRAINT proposal_cloud_vms_cloud_request_id_proposal_cloud_requests_id_ FOREIGN KEY (cloud_request_id) REFERENCES public.proposal_cloud_requests(id) ON DELETE CASCADE;


--
-- Name: proposal_drafts proposal_drafts_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: proposal_drafts proposal_drafts_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_drafts
    ADD CONSTRAINT proposal_drafts_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: proposal_existing_equipments proposal_existing_equipments_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_existing_equipments
    ADD CONSTRAINT proposal_existing_equipments_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_hardware_costs proposal_hardware_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_hardware_costs
    ADD CONSTRAINT proposal_hardware_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_ict_personnel proposal_ict_personnel_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_ict_personnel
    ADD CONSTRAINT proposal_ict_personnel_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_manpower proposal_manpower_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_manpower
    ADD CONSTRAINT proposal_manpower_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_other_costs proposal_other_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_other_costs
    ADD CONSTRAINT proposal_other_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_personnel_costs proposal_personnel_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_personnel_costs
    ADD CONSTRAINT proposal_personnel_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_personnel_responsibilities proposal_personnel_responsibilities_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_personnel_responsibilities
    ADD CONSTRAINT proposal_personnel_responsibilities_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_related_projects proposal_related_projects_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_related_projects
    ADD CONSTRAINT proposal_related_projects_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_software_costs proposal_software_costs_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_software_costs
    ADD CONSTRAINT proposal_software_costs_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposal_training_food_costs proposal_training_food_costs_training_id_proposal_trainings_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_training_food_costs
    ADD CONSTRAINT proposal_training_food_costs_training_id_proposal_trainings_id_ FOREIGN KEY (training_id) REFERENCES public.proposal_trainings(id) ON DELETE CASCADE;


--
-- Name: proposal_training_speaker_costs proposal_training_speaker_costs_training_id_proposal_trainings_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_training_speaker_costs
    ADD CONSTRAINT proposal_training_speaker_costs_training_id_proposal_trainings_ FOREIGN KEY (training_id) REFERENCES public.proposal_trainings(id) ON DELETE CASCADE;


--
-- Name: proposal_trainings proposal_trainings_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_trainings
    ADD CONSTRAINT proposal_trainings_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;


--
-- Name: proposals proposals_department_id_departments_department_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_department_id_departments_department_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: proposals proposals_division_id_divisions_division_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_division_id_divisions_division_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(division_id);


--
-- Name: proposals proposals_project_id_projects_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_project_id_projects_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: proposals proposals_updated_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_updated_by_users_user_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(user_id);


--
-- Name: proposals proposals_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: resolutions resolutions_agenda_id_agendas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_agenda_id_agendas_id_fk FOREIGN KEY (agenda_id) REFERENCES public.agendas(id) ON DELETE CASCADE;


--
-- Name: resolutions resolutions_governed_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_governed_proposal_id_proposals_id_fk FOREIGN KEY (governed_proposal_id) REFERENCES public.proposals(id);


--
-- Name: resolutions resolutions_recorded_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_recorded_by_users_user_id_fk FOREIGN KEY (recorded_by) REFERENCES public.users(user_id);


--
-- Name: resolutions resolutions_resolution_status_id_resolution_statuses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_resolution_status_id_resolution_statuses_id_fk FOREIGN KEY (resolution_status_id) REFERENCES public.resolution_statuses(id);


--
-- Name: role_user role_user_assigned_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_assigned_by_users_user_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(user_id);


--
-- Name: role_user role_user_role_id_roles_role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_role_id_roles_role_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: role_user role_user_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_login_history user_login_history_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_login_history
    ADD CONSTRAINT user_login_history_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: users users_division_id_divisions_division_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_division_id_divisions_division_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(division_id);


--
-- Name: workflow_audit_events workflow_audit_events_actor_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_audit_events
    ADD CONSTRAINT workflow_audit_events_actor_id_users_user_id_fk FOREIGN KEY (actor_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict F8vVVokyxLlVVyyhUFvPsYhtDDyfwFJFlbqxKdjzbDaZ5ZNmHfwsMEWluEyuIOI

--
-- Database "postgres" dump
--

--
-- PostgreSQL database dump
--

\restrict htBGRaYuXyw7AjIJJRYor93VoPvfTujJdZZbe41h7hpBK0SBy7sptN7CDgtFuaf

-- Dumped from database version 15.19 (Debian 15.19-1.pgdg13+2)
-- Dumped by pg_dump version 15.19 (Debian 15.19-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\unrestrict htBGRaYuXyw7AjIJJRYor93VoPvfTujJdZZbe41h7hpBK0SBy7sptN7CDgtFuaf
\connect postgres
\restrict htBGRaYuXyw7AjIJJRYor93VoPvfTujJdZZbe41h7hpBK0SBy7sptN7CDgtFuaf

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- PostgreSQL database dump complete
--

\unrestrict htBGRaYuXyw7AjIJJRYor93VoPvfTujJdZZbe41h7hpBK0SBy7sptN7CDgtFuaf

--
-- PostgreSQL database cluster dump complete
--

