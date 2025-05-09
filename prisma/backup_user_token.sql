PGDMP  &    -                |            geop-dev    16.2    16.2                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16459    geop-dev    DATABASE     v   CREATE DATABASE "geop-dev" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
    DROP DATABASE "geop-dev";
                postgres    false            �            1259    18596    Token    TABLE     �  CREATE TABLE public."Token" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    token text NOT NULL,
    url text,
    type text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Token";
       public         heap    postgres    false            �            1259    18595    Token_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Token_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public."Token_id_seq";
       public          postgres    false    219                       0    0    Token_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public."Token_id_seq" OWNED BY public."Token".id;
          public          postgres    false    218            �            1259    18584    User    TABLE     �  CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'NEW_USER'::public."Role" NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "responsibleId" integer
);
    DROP TABLE public."User";
       public         heap    postgres    false            �            1259    18583    User_id_seq    SEQUENCE     �   CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public."User_id_seq";
       public          postgres    false    217                       0    0    User_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;
          public          postgres    false    216            b           2604    18599    Token id    DEFAULT     h   ALTER TABLE ONLY public."Token" ALTER COLUMN id SET DEFAULT nextval('public."Token_id_seq"'::regclass);
 9   ALTER TABLE public."Token" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    219    219            ^           2604    18587    User id    DEFAULT     f   ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);
 8   ALTER TABLE public."User" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    217    217            �          0    18596    Token 
   TABLE DATA           n   COPY public."Token" (id, "userId", token, url, type, "expiresAt", used, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    219   �       �          0    18584    User 
   TABLE DATA           z   COPY public."User" (id, email, username, password, role, verified, "createdAt", "updatedAt", "responsibleId") FROM stdin;
    public          postgres    false    217   �                  0    0    Token_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."Token_id_seq"', 8, true);
          public          postgres    false    218            	           0    0    User_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public."User_id_seq"', 141, true);
          public          postgres    false    216            i           2606    18605    Token Token_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Token" DROP CONSTRAINT "Token_pkey";
       public            postgres    false    219            g           2606    18594    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public            postgres    false    217            j           1259    18623    Token_token_key    INDEX     M   CREATE UNIQUE INDEX "Token_token_key" ON public."Token" USING btree (token);
 %   DROP INDEX public."Token_token_key";
       public            postgres    false    219            e           1259    18622    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public            postgres    false    217            k           1259    18624    idx_token_userId    INDEX     J   CREATE INDEX "idx_token_userId" ON public."Token" USING btree ("userId");
 &   DROP INDEX public."idx_token_userId";
       public            postgres    false    219            l           2606    18627    Token Token_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 E   ALTER TABLE ONLY public."Token" DROP CONSTRAINT "Token_userId_fkey";
       public          postgres    false    219    4199    217            �   U  x���Ar!E��)t1M7��"��U4��>�GJ*V�QMi������D�:�4uG2`&*�;Q� -�yY�yI�������~�崶��y�o������yY�O�Ӹ[�-~Z�돿�#�� >yNĖ���E�����3[U�l�Kͥ�Rk�P�Ш�r-�X�!�ݲM��E4����@�򁍒���'�D����{�����C2�ewe��QM����~�Ht�{��\&S���1�0Q�ttPA"c@-���ݕَ��3%�S�&��m��A�`�wFJ��}�SS�=c��>�^��m�x H��_�������+�|x��0|��      �   -  x����r�@E��Wh��N�Vf���0� .W��AK6�o����"F)o����>��m	ST����oX�F������X��G� ��R@�KH)Q$a� �A1ԉ�%����ƾ�GЋ��!�R��� �^�E2)bT�{�Кz�e��eT�ջ�c�S&�Ь��`�^�c#��U��|�-z��-Ӿ�E	Ɇ�T��z�U�ʐySԣ�bY]��CiO���;��(��$��`���s�֑J5�Nw�nƤ��ۈ��|Q�u2gͩ3�,R�l*-�)�jK���`��7���{�ѻ�M��@��I�pY6��<�.Sl2�q���~HO��SFo�r薾�A�I�����"Kg���џ���Z��/�N�vSs���t�t��x�C�e�z�6�b�2�>�������W5ٹ$���0�@�%�:���%�Q�ҔA5s��Av�9���|�Eݼ<6�����������K�CNy�D�����N��U��f:���1X�F0��^|S֎J֞`7�?��nv<M-!,!dl(����
��g�c�     