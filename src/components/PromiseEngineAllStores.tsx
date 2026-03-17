import { useMemo, useState } from "react";
import { Search, MapPin, Clock, Bike, Package, CheckCircle2, Store, RefreshCw } from "lucide-react";

/**
 * PROMISE ENGINE MVP - LOVABLE
 *
 * O que este componente faz:
 * - Recebe CEP do cliente
 * - Busca endereço no ViaCEP
 * - Geocodifica endereço do cliente
 * - Faz parse da base TSV das lojas
 * - Geocodifica lojas sem lat/lng e salva cache no localStorage
 * - Calcula loja mais próxima
 * - Mostra opções de entrega
 *
 * IMPORTANTE:
 * 1) Cole TODA a sua base no RAW_STORES_TSV
 * 2) Idealmente depois você sobe isso para backend / MuleSoft
 * 3) Para produção, geocodificação deve ir para backend com cache persistente
 */

// =========================
// 1) COLE A BASE AQUI
// =========================
const RAW_STORES_TSV = `
Quant.	Cód.	Loja	ENDEREÇO	BAIRRO	CEP	CIDADE	Estado
1	1336	Agudo	RUA MAL DEODORO, 380.	CENTRO	96540-000	Agudo	RS
1	1648	Acegua	RUA QUINHENTOS E QUATRO, 73	CENTRO	96445-000	Acegua	RS
1	136	Alegrete 1	RUA GASPAR MARTINS, 168 - ESQ. GAL. SAMPAIO	CENTRO	97542-000	Alegrete	RS
1	181	Alegrete 2	RUA DOS ANDRADAS, 325	CENTRO	97541-001	Alegrete	RS
1	521	Alegrete 3	AVENIDA ASSIS BRASIL, 652.	CENTRO	97543-000	Alegrete	RS
1	1208	Alegrete 5	RUA VASCO ALVES, 183.	CENTRO	97542-600	Alegrete	RS
1	1195	Alegrete 6	AVENIDA TIARAJU, 489.	IBIRAPUITA	97546-550	Alegrete	RS
1	1499	Alegrete 7	RUA SIMPLICIO JACQUES,972	VL NOVA	97541-480	Alegrete	RS
1	1300	Alto Parana	AVENIDA PARANA, 2294.	CENTRO	87750-000	Alto Parana	PR
1	193	Alvorada 1	AV. PRES GETÚLIO VARGAS, 1746 – LJ 01	BELA VISTA	94810-000	Alvorada	RS
1	1130	Alvorada 10	AVENIDA PRESIDENTE GETULIO VARGAS, 1390.	BELA VISTA	94810-000	Alvorada	RS
1	493	Alvorada 2	AV PRESIDENTE GETULIO VARGAS, 2375.	BELA VISTA	94810-001	Alvorada	RS
1	1045	Alvorada 7	VENIDA ZERO HORA, 1100.	JD ALGARVE	94858-000	Alvorada	RS
1	1120	Alvorada 9	EST FREDERICO DIHL, 3196.	APARECIDA	94853-250	Alvorada	RS
1	854	Ampere	RUA XV DE NOVEMBRO, 1436.	CENTRO	85640-000	Ampere	PR
1	269	Antonio Prado	AV. VALDOMIRO BOCHESSE, 955 - LOJA 202	CENTRO	95250-000	Antonio Prado	RS
1	859	Apucarana 1	RUA DR. NAGIB DAHER, 464.	CENTRO	86800-040	Apucarana	PR
1	877	Apucarana 2	RUA FIRMAN NETO, 426	VILA SÃO JOSÉ	86808-020	Apucarana	PR
1	874	Apucarana 3	RUA PADRE SEVERINO CERUTTI, 272	VILA SÃO JOSÉ	86808-080	Apucarana	PR
1	895	Apucarana 4	AVENIDA GOVERNADOR ROBERTO DA SILVEIRA, 110.	BARRA FUNDA	86800-520	Apucarana	PR
1	1270	Apucarana 5	PCA RUY BARBOSA, 246.	CENTRO	86800-700	Apucarana	PR
1	1285	Apucarana 6	RUA NOVA UKRANIA, 362	VILA NOSSA SENHORA DA CONCEICAO	86802-500	Apucarana	PR
1	1388	Apucarana 7	AV CORIFEU DE AZEVEDO MARQUES, 332.	CENTRO	86.800-230	Apucarana	PR
1	853	Arapongas 1	RUA GATURAMO, 649.	JARDIM PRIMAVERA	86702-525	Arapongas	PR
1	1137	Arapongas 2	RUA DRONGO, 769.	VILA CASCATA	86701-474	Arapongas	PR
1	1174	Arapongas 3	AVENIDA ARAPONGAS, 44.	CENTRO	86700-050	Arapongas	PR
1	1380	Arapongas 4	RUA ALBATROZ REAL, 32.	CONJUNTO DEL CONDOR	86.703-341	Arapongas	PR
1	1591	Arapoti	MOISES LUPION, 316	CENTRO	84.990-000	Arapoti	PR
1	1633	Ararangua - Nova	RUA VIRGULINO DE QUEIROZ, 95	CENTRO	88900-009	Ararangua	SC
1	1343	Araruna	AV PRESIDENTE VARGAS, 640.	CENTRO	87.260-000	Araruna	PR
1	1025	Araucária	RUA MANOEL RIBAS, 326.	CENTRO	83702-035	Araucaria	PR
1	1415	Araquari	AVENIDA PREFEITO ALBERTO NATALINO MIQUELUTE, 7000	ITINGA	89245-000	Araquari	SC
1	243	Arroio Do Meio 1	RUA DR JOAO CARLOS MACHADO, 1236.	CENTRO	95940-000	Arroio do Meio	RS
1	1403	Arroio Do Meio 2	R DR JOAO CARLOS MACHADO, 981	CENTRO	95940-000	Arroio do Meio	RS
1	710	Arroio do Sal 1	RUA ASSIS BRASIL, 298.	CENTRO	95585-000	Arroio do Sal	RS
1	1238	Arroio do Sal 2	RUA ASSIS BRASIL, 721.	CENTRO	95585-000	Arroio do Sal	RS
1	1016	Arroio dos Ratos	AVENIDA ESPANHA, 18.	CENTRO	96740-000	Arroio dos Ratos	RS
1	1616	Arroio do Tigre	RUA DOM GUILHERME MULLER, 881	CENTRO	96950-000	Arroio do Tigre	RS
1	121	Arroio Grande 1	AV. VISCONDE DE MAUÁ, 383	CENTRO	96330-000	Arroio Grande	RS
1	395	Arroio Grande 2	AV. VISCONDE DE MAUÁ, 1054	CENTRO	96330-000	Arroio Grande	RS
1	987	Arvorezinha	RUA OSVALDO ARANHA, 490.	CENTRO	95995-000	Arvorezinha	RS
1	1002	Assis Chateaubriand 1	AVENIDA TUPASSI, 835.	CENTRO	85935-000	Assis Chateaubriand	PR
1	1389	Assis Chateaubriand 2	AV TUPASSI, 2905.	CENTRO	85935-000	Assis Chateaubriand	PR
1	924	Astorga	AVENIDA PRESIDENTE GETULIO VARGAS, 280.	CENTRO	86730-000	Astorga	PR
1	135	Bage 1	AV. SETE DE SETEMBRO, 1089	CENTRO	96400-003	Bage	RS
1	152	Bage 2	AV. SETE DE SETEMBRO, 837	CENTRO	96400-006	Bage	RS
1	391	Bage 3	RUA GENERAL NETO, 115	CENTRO	96400-380	Bage	RS
1	398	Bage 4	AV. JOSÉ DO PATROCINIO, 300.	SÃO JUDAS	96415-500	Bage	RS
1	399	Bage 5	AVENIDA SANTA TECLA, 1076.	GETULIO VARGAS	96412-000	Bage	RS
1	1381	Bage 6	AV EMILIO GUILAIN, 501.	ESTRELA DALVA	96400-000	Bage	RS
1	1564	Bal. Arroio do Silva	AVENIDA BARRIGA VERDE, 504	CENTRO	88914-000	Bal. Arroio do Silva	SC
1	228	Bal. Camboriu 1	AV. BRASIL, 1300 - LOJA 03	CENTRO	88330-048	Balneario Camboriu	SC
1	282	Bal. Camboriu 2	AV. DO ESTADO, 1520	CENTRO	88338-640	Balneario Camboriu	SC
1	1250	Bal. Camboriu 3	RUA OSMAR DE SOUZA NUNES, 844.	CENTRO	88331-070	Balneario Camboriu	SC
1	1310	Bal. Camboriu 4	RUA PARAGUAI, 645.	DAS NAÇÕES	88338-090	Balneario Camboriu	SC
1	1430	Bal. Camboriu 5	RUA 1500, 640.	CENTRO	88330-524	Balneario Camboriu	SC
1	1494	Balneario Gaivota	AVENIDA SANTA CATARINA, 353	CENTRO	88955-000	Balneario Gaivota	SC
1	1427	Balneario Picarras	AVENIDA NEREU RAMOS, 482.	CENTRO	88380-000	Balneario Picarras	SC
1	915	Balneario Pinhal	AV ITALIA, 2089	CENTRO	95599-000	Balneario Pinhal	RS
1	1458	Balneario Rincao	AVENIDA LEOBERTO LEAL, 836.	CENTRO	88828-000	Balneario Rincao	SC
1	721	Barra do Ribeiro	AV VISCONDE DO RIO GRANDE, 1504.	CENTRO	96790-000	Barra do Ribeiro	RS
1	1662	Barra do Quarai 1	RUA SALUSTIANO MARTY, 510	CENTRO	97538-000	Barra do Quarai	RS
1	1478	Barra Velha	RUA WALDEMAR FRANCISCO, 355	SAO CRISTOVAO	88390-000	Barra Velha	SC
1	1042	Barros Cassal	RUA DR. CEFERINO BARBOSA, 401.	CENTRO	99360-000	Barros Cassal	RS
1	1330	Bela Vista do Paraiso	AV INDEPENDENCIA, 618.	BRASILIO DE ARAUJO	86130-000	Bela Vista do Paraíso	PR

1	1614	Santa Maria 47 Nova	RUA DUQUE DE CAXIAS, 3144	NONOAI	97060-210	Santa Maria	RS
1	1593	Santa Maria 48	AV PREFEITO EVANDRO BEHR, 5446	CAMOBI	97110-800	Santa Maria	RS
1	1594	Santa Maria 49	RUA FLORIANOPOLIS, 984	PARQUE PINHEIRO MACHADO	97030-220	Santa Maria	RS
1	1607	Santa Maria 50	ROD BR 287 KM 245.671 AO KM 246.799 IMP, 2885	PATRONATO	97020-405	Santa Maria	RS
1	84	Santa Maria 5	AV. PAULO LAUDA, 530 - SALA 02	TANCREDO NEVES	97032000	Santa Maria	RS
1	164	Santa Maria 6	RUA PINHEIRO MACHADO Nº2394 – LJ 1	CENTRO	97050-600	Santa Maria	RS
1	182	Santa Maria 7	AV. PRESIDENTE VARGAS, 1944	CENTRO	97015-512	Santa Maria	RS
1	225	Santa Maria 9 - Hosp	RUA JOSÉ BONIFÁCIO, 2355 – LOJA 01	CENTRO	97015-450	Santa Maria	RS
1	23	Santa Rosa 1	AV. RIO BRANCO, 345	CENTRO	98780-738	Santa Rosa	RS
1	1439	Santa Rosa 2	R DOUTOR FRANCISCO TIMM, 505.	CENTRO	98780-803	Santa Rosa	RS
1	1192	Santa Rosa 4	RUA SINVAL SALDANHA, 407.	CENTRO	98780-080	Santa Rosa	RS
1	1307	Santa Rosa 5	AV EXPEDICIONARIO WEBER, 425.	CENTRO	98780-340	Santa Rosa	RS
1	1577	Santa Rosa 6	AV RIO BRANCO, 68	CENTRO	98780-340	Santa Rosa	RS
1	1600	Santa Rosa 7	AV TUPARENDI, 1010	CENTRO	98780-630	Santa Rosa	RS
1	27	Santiago 1	AV. GETÚLIO VARGAS, 1971	CENTRO	97700-365	Santiago	RS
1	469	Santiago 2	RUA SETE DE SETEMBRO, 573.	CENTRO	97700-000	Santiago	RS
1	645	Santiago 3	AVENIDA GETULIO VARGAS, 1841.	CENTRO	97700-000	Santiago	RS
1	1541	Santiago 4	RUA BENTO GONCALVES, 880	LULU GENRO	97707-003	Santiago	RS
1	1538	Santiago 5	RUA TITO BECCON, 271	VL NOVA	97714-015	Santiago	RS
1	75	Santo Angelo 1	RUA MARQUÊS DO HERVAL, 1634	CENTRO	98801-640	Santo Angelo	RS
1	138	Santo Angelo 2	AVENIDA BRASIL, 1061. - ESQUINA MARECHAL FLORIANO	CENTRO	98801-590	Santo Angelo	RS
1	194	Santo Angelo 3	R. MARQUES DO HERVAL, 965	CENTRO	98801-640	Santo Angelo	RS
1	218	Santo Angelo 4	AV. BRASIL, 793 – LOJA 01	CENTRO	98801-590	Santo Angelo	RS
1	563	Santo Angelo 5	RUA SETE DE SETEMBRO, 894.	CENTRO	98801-726	Santo Angelo	RS
1	1007	Santo Angelo 7	AVENIDA SAGRADA FAMILIA, 1041.	HORTENCIA	98807-179	Santo Angelo	RS
1	1360	Santo Angelo 8	AV BRASIL, 523	CENTRO	98801-590	Santo Angelo	RS
1	1548	Santo Angelo 9	RUA MARQUES DO HERVAL, 1784	CENTRO	98803-390	Santo Angelo	RS
1	1589	Sto Ant das Missoes Nova	AV FLORDUARTE JOSE MARQUES, 6148	CENTRO	97870-000	Santo Antonio das Missoes	RS
1	1637	Santo Cristo 1 - Nova	RUA DOM PEDRO II, 2037	CENTRO	98960-000	Santo Cristo	RS
1	1570	Sao Bento do Sul	RUA FELIPE SCHMIDT, 47	CENTRO	89280-178	Sao Bento do Sul	SC
1	47	Sao Borja 1	RUA GENERAL OSÓRIO, 2179	CENTRO	97670-000	Sao Borja	RS
1	140	Sao Borja 2	RUA CORONEL LAGO, 1878	CENTRO	97670-000	Sao Borja	RS
1	267	Sao Borja 3	R. GENERAL MARQUES, 1226 - TERRO	CENTRO	97670-000	Sao Borja	RS
1	281	Sao Borja 4	R. PRESIDENTE VARGAS, 1883 - LOJA 01	CENTRO	97670-000	Sao Borja	RS
1	411	Sao Borja 5	AV FRANCISCO MIRANDA, 944.	PASSO	97670000	Sao Borja	RS
1	625	Sao Borja 6	RUA GENERAL MARQUES, 440	CENTRO	97670-000	Sao Borja	RS
1	1327	Sao Borja 7	R CANDIDO FALCAO,1125	CENTRO	97670-000	Sao Borja	RS
1	43	Sao Gabriel 1	RUA CORONEL SEZEFREDO, 662	CENTRO	97300-222	Sao Gabriel	RS
1	93	Sao Gabriel 2	RUA DUQUE DE CAXIAS, 178 - SALA 1	CENTRO	97300-226	Sao Gabriel	RS
1	473	Sao Gabriel 3	AVENIDA JULIO DE CASTILHOS, 271. LOJA 01 ESQ AV BARAO DOP CAMBAY	CENTRO	97300-110	Sao Gabriel	RS
1	476	Sao Gabriel 4	AV FRANCISCO GONCALVES CHAGAS, 3227	INDEPENDENCIA	97313-270	Sao Gabriel	RS
1	1526	São Gabriel 5	RUA MARIO AVANCINI DOS SANTOS, 32	GABRIELENSE	97306-002	Sao Gabriel	RS
1	180	Sao Jeronimo 1	RUA RAMIRO BARCELOS, 465	CENTRO	96700-000	Sao Jeronimo	RS
1	1293	Sao Jeronimo 2	RUA RIO BRANCO, 985.	BELA VISTA	96700-000	Sao Jeronimo	RS
1	1294	Sao Joao Batista	RUA JOSE ANTONIO DA SILVA, 19.	CENTRO	88240-000	Sao Joao Batista	SC
1	1413	Sao Joaquim	RUA MAJOR JACINTO GOULART, 13.	CENTRO	88600-000	Sao Joaquim	SC
1	613	Sao Jose 3	AVENIDA LISBOA, 226	FORQUILHAS	88107-350	Sao Jose	SC
1	720	Sao Jose 4	R VIRGILINO FERREIRA SOUZA, 1.	BARREIROS	88117-700	Sao Jose	SC
1	747	Sao Jose 5	R JACOB SENS, 316.	AREIAS	88113-285	Sao Jose	SC
1	1237	Sao Jose 6	AVENIDA LEDIO JOÃO MARTINS, 543.	KOBRASOL	88102-000	Sao Jose	SC
1	1527	Sao Jose 7	RUA GERONCIO THIVES, 579	BARREIROS	88117-291	Sao Jose	SC
1	1571	Sao Jose 8	AVENIDA LEOBERTO LEAL, 44	BARREIROS	88117-000	Sao Jose	SC
1	1572	Sao Jose 9	RUA OTTO JULIO MALINA, 1780	IPIRANGA	88111-500	Sao Jose	SC
1	246	Sao Leopoldo 1	R INDEPENDENCIA, 345 - LJ 01	CENTRO	93010-001	Sao Leopoldo	RS
1	576	Sao Leopoldo 10	RUA 1º DE MARÇO, 834.	CENTRO	93010-210	Sao Leopoldo	RS
1	715	Sao Leopoldo 13	RUA SÃO JOAQUIM, 1262.	CENTRO	93010-190	Sao Leopoldo	RS
1	917	Sao Leopoldo 16	AV THOMAZ EDISON, 2603.	SCHARLAU	93125-144	Sao Leopoldo	RS
1	1060	Sao Leopoldo 17	AV MAUA, 1900.	MORRO DO ESPELHO	93030-092	Sao Leopoldo	RS
1	1115	Sao Leopoldo 18	RUA DR HILLEBRAND, 1280.	RIO DOS SINOS	93110-100	Sao Leopoldo	RS
1	1442	Sao Leopoldo 19	RUA CONCEICAO, 769.	CENTRO	93010-070	Sao Leopoldo	RS
1	1605	São Leopoldo 20	AV JOAO CORREA, 380	MORRO DO ESPELHO	93030-245	Sao Leopoldo	RS
1	1612	São Leopoldo 21	AV SAO BORJA, 596	RIO BRANCO	93040-606	Sao Leopoldo	RS
1	284	Sao Leopoldo 2	AV PAROBE, 421	SCHARLAU	93125-000	Sao Leopoldo	RS
1	374	Sao Leopoldo 4	RUA INDEPENDENCIA, 570	CENTRO	93010002	Sao Leopoldo	RS
1	492	Sao Leopoldo 5	AV FEITORIA, 4585.	FEITORIA	93052-105	Sao Leopoldo	RS
1	516	Sao Leopoldo 6	R BENTO GONCALVES, 1316.	CENTRO	93010-220	Sao Leopoldo	RS
1	517	Sao Leopoldo 7	AV SAO BORJA, 983.	JARDIM AMÉRICA	93032-200	Sao Leopoldo	RS
1	559	Sao Leopoldo 8	AVENIDA HENRIQUE BIER, 1266.	CAMPINA	93135-000	Sao Leopoldo	RS
1	68	Sao Lourenco 1	RUA CORONEL ALFREDO BORN, 525 - SALA 01	CENTRO	96170-000	Sao Lourenco do Sul	RS
1	626	Sao Lourenco 2	RUA CORONEL ALFREDO BORN, 400.	CENTRO	96170-000	Sao Lourenco do Sul	RS
1	1404	Sao Lourenco 3	AV MARECHAL FLORIANO PEIXOTO, 1740.	CENTRO	96170-000	Sao Lourenco do Sul	RS
1	1173	São Lourenço do Oeste	RUA RUI BARBOSA, 438.	CENTRO	89990-000	Sao Lorenco do Oeste	SC
1	320	Sao Luiz Gonzaga 1	R. SENADOR PINHEIRO MACHADO, 2479 - LJ 01	CENTRO	97800-000	Sao Luiz Gonzaga	RS
1	624	Sao Luiz Gonzaga 2	RUA SÃO JOÃO, 1662	CENTRO	97800-000	Sao Luiz Gonzaga	RS
1	1656	Sao Luiz Gonzaga 3	AV SEN PINHEIRO MACHADO, 1505	CENTRO	97800-000	Sao Luiz Gonzaga	RS
1	1537	São Ludgero	RUA PADRE ROHER, 210	CENTRO	88730-000	Sao Ludgero	SC
1	37	Sao Marcos 1	AV. VENÂNCIO AIRES, 1078.	CENTRO	95190-000	Sao Marcos	RS
1	545	Sao Marcos 2	AVENIDA VENÂNCIO AIRES, 900.	CENTRO	95190-000	Sao Marcos	RS
1	983	São Mateus do Sul	RUA ULISSES FARIA, 738.	CENTRO	83900-000	Sao Mateus do Sul	PR
1	1106	São Miguel do Iguaçu	RUA ALFREDO CHAVES, 169.	CENTRO	85877-000	Sao Miguel do Iguaçu	PR
1	1405	São Miguel do Oeste	RUA ALMIRANTE TAMANDARE, 1015.	CENTRO	89900-000	Sao Miguel do Oeste	SC
1	1590	São Pedro do Sul Nova	RUA 15 DE NOVEMBRO, 588	CENTRO	97400-000	Sao Pedro do Sul	RS
1	172	Sao Sebastiao 1	AV EGIDIO MICHAELSEN, 501	CENTRO	95760-000	S. Sebastiao do Cai	RS
1	1474	Sao Sebastiao 2	RUA 13 DE MAIO, 936.	CENTRO	95760-000	S. Sebastiao do Cai	RS
1	276	Sao Sepe 1	R. PLACIDO GONÇALVES, 1339 - LOJA 01	CENTRO	97340-000	Sao Sepe	RS
1	1322	Sao Sepe 2	RUA CLEMENCIANO BARNASQUE,1479.	CENTRO	97340-000	Sao Sepe	RS
1	163	Sapiranga 1	AV. JOÃO CORRÊA, 1184 SL1	CENTRO	93800-028	Sapiranga	RS
1	292	Sapiranga 2	AV. PRESIDENTE KENNEDY, 1054.	SÃO LUIZ	93806-336	Sapiranga	RS
1	385	Sapiranga 3	AV. JOÃO CORREA, 966	CENTRO	93800-028	Sapiranga	RS
1	636	Sapiranga 4	AVENIDA VINTE DE SETEMBRO, 3841.	CENTRO	93800-238	Sapiranga	RS
1	1143	Sapiranga 6	RUA ALBERTO EINSTEIN, 136.	SETE DE SETEMBRO	93819-002	Sapiranga	RS
1	1450	Sapiranga 7	AV 20 DE SETEMBRO, 3679.	CENTRO	93800-238	Sapiranga	RS
1	331	Sapucaia Sul 1- Merc	AV. SAPUCAIA, 720 - LJ05	PRIMOR	93210240	Sapucaia do Sul	RS
1	348	Sapucaia Sul 2	R. PROFESSOR FRANCISCO BROCHADO DA ROCHA, 356, LOJA 02	CENTRO	93220680	Sapucaia do Sul	RS
1	757	Sapucaia Sul 5	RUA ULISSES CABRAL, 112.	CENTRO	93220-000	Sapucaia do Sul	RS
1	864	Sapucaia Sul 6	AV. CORONEL THEODOMIRO PORTO DA FONSECA, 1028.	NOVA SAPUCAIA	93226-392	Sapucaia do Sul	RS
1	1095	Sapucaia Sul 7	RUA RODRIGUES DE FIGUEIREDO, 33.	CENTRO	93220-360	Sapucaia do Sul	RS
1	1114	Sapucaia Sul 8	AV. JUSTINO CAMBOIM, 833.	CAMBOIM	93224-000	Sapucaia do Sul	RS
1	1265	Sapucaia Sul 9	RUA SÃO CAETANO, 173.	VARGAS	93222-430	Sapucaia do Sul	RS
1	13	Sarandi 1	AV. EXPEDICIONÁRIO, 1243.	CENTRO	99560-000	Sarandi	RS
1	861	Sarandi 1 - PR	AVENIDA LONDRINA, 922.	JARDIM INDEPENDENCIA	87114-010	Sarandi PR	PR
1	872	Sarandi 2	AV. SETE DE SETEMBRO, 1686.	CENTRO	99560-000	Sarandi	RS
1	940	Sarandi 2 - PR	AVENIDA CUIABA, 1001.	JARDIM STA TEREZA	87112-000	Sarandi PR	PR
1	1340	Sarandi 3	AV. EXPEDICIONARIO, 957.	CENTRO	99560-000	Sarandi	RS
1	1248	Sarandi 4 - PR	AVENIDA BRASIL, 936.	JARDIM INDEPENDENCIA II	87113-260	Sarandi PR	PR
1	1436	Sarandi 6 - PR	AV MARINGA, 2464.	JARDIM NOVA PAULISTA	87111-001	Sarandi PR	PR
1	1093	Seara	RUA HERCULANO HERCULES ZANUZZO, 426.	INDUSTRIAL	89770-000	Seara	SC
1	1067	Seberi	AV GEN FLORES DA CUNHA, 638.	CENTRO	98380-000	Seberi	RS
1	213	Serafina Correa 1	AV. MIGUEL SOCCOL, 2721 – LOJA 01	CENTRO	99250-000	Serafina Correa	RS
1	1387	Serafina Correa 2	RUA OTAVIO ROCHA, 341.	CENTRO	99250-000	Serafina Correa	RS
1	1332	Sertanopolis	AV DR VACYR GONCALVES PEREIRA, 268.	CENTRO	86170-000	Sertanopolis	PR
1	80	Soledade 1	AV. MARECHAL FLORIANO PEIXOTO, 718	CENTRO	99300-000	Soledade	RS
1	321	Soledade 2	AV. MARECHAL FLORIANO PEIXOTO, 932 - LJ 01	CENTRO	99300970	Soledade	RS
1	914	Soledade 4	R MARECHAL FLORIANO PEIXOTO, 1612	CENTRO	99300-000	Soledade	RS
1	844	Sombrio 1	AVENIDA GETULIO VARGAS , 466.	CENTRO	88960-000	Sombrio	SC
1	1573	Sombrio 2	RUA PADRE JOAO REITZ, 219	CENTRO	88960-000	Sombrio	SC
1	1467	Santa Terezinha do Itaipu	RUA PRIMEIRO DE MAIO, 444.	CENTRO	85875-000	STA TEREZINHA DE ITAIPU	PR
1	132	Sta. Vitoria Palmar 1	RUA BARÃO DO RIO BRANCO, 587 - SALA A	CENTRO	96230-000	Santa Vitoria do Palmar	RS
1	1511	Sta. Vitoria Palmar 2	AV JUSTINO AMONTE ANACKER, 44	CARDEAL	96230-000	Santa Vitoria do Palmar	RS
1	689	Sto Amaro Imperatriz 1	R PREFEITO JOSE KEHRIG, 5567.	CENTRO	88140-000	Sto. Amaro da Imperatriz	SC
1	1370	Sto Amaro Imperatriz 2	RUA PREFEITO JOSE KEHRIG, 5293.	CENTRO	88140-000	Sto. Amaro da Imperatriz	SC
1	795	Sto Ant Patrulha 1	RUA FRANCISCO JOSÉ LOPES, 55.	CENTRO	95500-000	Santo Antonio da Patrulha	RS
1	837	Sto Ant Patrulha 2	AV CEL VICTOR VILLA VERDE, 152.	CENTRO	95500-000	Santo Antonio da Patrulha	RS
1	1420	Sto Ant Patrulha 3	AV CEL VICTOR VILLA VERDE, 271.	CENTRO	95500-000	Santo Antonio da Patrulha	RS
1	1402	Sto Ant Patrulha 4	RUA JOAO PEDROSO DA LUZ, 324.	VARZEA	95500-000	Santo Antonio da Patrulha	RS
1	1587	Taio	RUA CORONEL FEDDERSEN, 2139	CENTRO	89190-000	Taio	SC
1	1333	Tapejara - PR	AV RUI BARBOSA, 397.	CENTRO	87430-000	Tapejara	PR
1	64	Tapejara 1	RUA DO COMÉRCIO, 1133.	CENTRO	99950-000	Tapejara	RS
1	858	Tapejara 2	AVENIDA 7 DE SETEMBRO, 1031.	CENTRO	99950-000	Tapejara	RS
1	1613	Tapejara 3	AVENIDA 7 DE SETEMBRO, 2391	SAO PAULO	99950-000	Tapejara	RS
1	512	Tapera	AV QUINZE DE NOVEMBRO,1343.	CENTRO	99490-000	Tapera	RS
1	94	Tapes 1	R FELISSIMO DE ALFONSIN, 740	CENTRO	96760-000	Tapes	RS
1	268	Tapes 2	AV. ASSIS BRASIL, 440	CENTRO	96760-000	Tapes	RS
1	65	Taquara 1	R JÚLIO DE CASTILHOS, 2610.	CENTRO	95600-000	Taquara	RS
1	156	Taquara 2	RUA MARECHAL FLORIANO, 1524	CENTRO	95600-032	Taquara	RS
1	315	Taquara 3	R. JULIO DE CASTILHOS, 2582 - LOJA 01	CENTRO	95600-000	Taquara	RS
1	821	Taquara 5	RUA BENTO GONÇALVES 2411.	CENTRO	95600-118	Taquara	RS
1	1199	Taquara 6	RUA HUMBERTO CASTELO BRANCO, 2268.	PETROPOLIS	95607-028	Taquara	RS
1	1200	Taquara 7	RUA TRISTÃO MONTEIRO, 1461.	CENTRO	95600-066	Taquara	RS
1	286	Taquari 1	R. SETE DE SETEMBRO, 2277 - LJ 01	CENTRO	95860-000	Taquari	RS
1	294	Taquari 2	AV. SETE DE SETEMBRO, 2635 - LJ 01	CENTRO	95860-000	Taquari	RS
1	1319	Taquari 3	AV LAUTERT FILHO, 1016.	COLONIA VINTE	95860-000	Taquari	RS
1	1574	Tenente Portela	RUA ARTUR AMBROS, 15	CENTRO	98500-000	Tenente Portela	RS
1	1185	Terra Boa	AVENIDA BRASIL, 866.	ZONA UM	87240-000	Terra Boa	PR
1	1090	Terra de Areia	RUA ELPIDIO GOMES, 3915.	CENTRO	95535-000	Terra de Areia	RS
1	1198	Terra Rica	AVENIDA SÃO PAULO, 1445.	CENTRO	87890-000	Terra Rica	PR
1	98	Teutonia 1	RUA MAJOR BANDEIRA, 740	LANGUIRÚ	95890-000	Teutonia	RS
1	418	Teutonia 2	RUA ARTHUR PILZ, 225	LANGUIRÚ	95890000	Teutonia	RS
1	745	Teutonia 3	R CAPITAO SCHNEIDER, 319.	CANABARRO	95890-000	Teutonia	RS
1	1257	Tijucas 1	AVENIDA JACOB LAMEU TAVARES, 125.	CENTRO	88200-000	Tijucas	SC
1	1509	Tijucas 2	AV JACARANDA, 311	UNIVERSITARIO	88200-000	Tijucas	SC
1	1134	Timbo	AVENIDA GESTULIO VARGAS, 500.	CENTRO	89120-000	Timbo	SC
1	984	Toledo 1	RUA SANTOS DUMONT, 2309.	CENTRO	85900-010	Toledo	PR
1	1017	Toledo 2	AVENIDA PARIGOT DE SOUZA, 4390.	JARDIM SANTA MARIA	85903-170	Toledo	PR
1	1201	Toledo 3	RUA PRIMEIRO DE MAIO, 1670.	VILA PIONEIRO	85909-010	Toledo	PR
1	1647	Toledo 4	AV MARIPA, 5726	CENTRO	85901-000	Toledo	PR
1	127	Torres 1	AV. BARÃO DO RIO BRANCO, 152	CENTRO	95560-000	Torres	RS
1	344	Torres 2	AV. JOSE BONIFACIO, 382 - LOJA 01	CENTRO	95560000	Torres	RS
1	566	Torres 3	AV BARAO DO RIO BRANCO, 328.	CENTRO	95560-000	Torres	RS
1	740	Torres 4	AV GENERAL OSORIO, 414	PREDIAL	95560-000	Torres	RS
1	756	Torres 5	R BARRAO DO RIO BRANCO, 16	CENTRO	95560-000	Torres	RS
1	1037	Torres 7 - Merc	AV CASTELO BRANCO, 1010.	ENGENHO VELHO	95560-000	Torres	RS
1	1055	Torres 8	RUA AMAZONAS, 810.	CENTRO - STAN	95560-000	Torres	RS
1	1552	Torres 9	AV JOSE BONIFACIO, 1220	CENTRO	95560-000	Torres	RS
1	1553	Torres 10	RUA ERNESTO SILVA, 145	IGRA-SUL	95560-000	Torres	RS
1	123	Tramandai 1	AV. EMANCIPAÇÃO, 265	CENTRO	95590-000	Tramandai	RS
1	329	Tramandai 2	AV. EMANCIPAÇÃO, 1025 - LJ 01 E 02	CENTRO	95590000	Tramandai	RS
1	585	Tramandai 3	AV EMANCIPACAO, 846.	CENTRO	95590-000	Tramandai	RS
1	775	Tramandai 4	AV FERNANDES E BASTOS, 1513.	CENTRO	95590-000	Tramandai	RS
1	718	Tramandai 5	R 24 DE SETEMBRO, 156.	CENTRO	95590-000	Tramandai	RS
1	1461	Tramandai 6	AV MINAS GERAIS, 1263	CENTRO	95590-000	Tramandai	RS
1	1536	Tramandai 7	AV FLORES DA CUNHA, 6940	CENTRO	95590-000	Tramandai	RS
1	989	Três Cachoeiras	AV PE RIZZIERI DELAI, 705.	CENTRO	95580-000	Tres Cachoeiras	RS
1	177	Tres Coroas 1 - Merc	R MUNDO NOVO, 11.	CENTRO	95660-000	Tres Coroas	RS
1	647	Tres Coroas 2	RUA MUNDO NOVO, 270.	CENTRO	95660-000	Tres Coroas	RS
1	1225	Tres Coroas 3	AV JOAO CORREA, 446.	CENTRO	95660-000	Tres Coroas	RS
1	183	Tres De Maio 1	AV. URUGUAI, 513	CENTRO	98910-970	Tres de Maio	RS
1	571	Tres De Maio 2	AV URUGUAI, 410.	CENTRO	98910-000	Tres de Maio	RS
1	814	Tres de Maio 3	AVENIDA SENADOR ALBERTO PASQUALINI, 944.	PRIMAVERA	98910-000	Tres de Maio	RS
1	1566	Tres de Maio 4	AV SANTA ROSA, 780	CENTRO	98910-000	Tres de Maio	RS
1	5	Tres Passos 1	AV. JÚLIO DE CASTILHOS, 1060.	CENTRO	98600-000	Tres Passos	RS
1	17	Tres Passos 2	AV. JÚLIO DE CASTILHOS, 1301	CENTRO	98600-000	Tres Passos	RS
1	1598	Tres Passos 3	AV JULIO DE CASTILHOS, 170	CENTRO	98600-000	Tres Passos	RS
1	278	Triunfo 1	R. LUIZ BARRETO, 551 - LJ 01	CENTRO	95840-000	Triunfo	RS
1	825	Triunfo 2	R. LUIZ BARRETO, 147 - SL 2	CENTRO	95840-000	Triunfo	RS
1	1348	Tubarão	RUA ALTAMIRO GUIMARAES, 786.	CENTRO	88701-302	Tubarao	SC
1	187	Tupancireta 1	AV. VAZ DE FERREIRA, 1118	CENTRO	98170-000	Tupancireta	RS
1	836	Tupancireta 2	AV. RIO BRANCO, 437.	CENTRO	98170-000	Tupancireta	RS
1	1557	Turvo	RUA FREI GREGORIO DAL MONTE, 1263	CENTRO	88930-000	Turvo	SC
1	1386	Umuarama 1	AVENIDA PARANA, 5194.	ZONA III	87502-000	Umuarama	PR
1	1418	Umuarama 2	AV ANHANGUERA, 3113.	ZONA V	87504-290	Umuarama	PR
1	1419	Umuarama 3	AV TIRADENTES, 2927.	ARDIM PARAISO	87505-090	Umuarama	PR
1	1466	Umuarama 4	AVENIDA PARANA, 7316.	ZONA III	87502-000	Umuarama	PR
1	38	Uruguaiana 1	RUA DUQUE DE CAXIAS, 1170	CENTRO	97501-584	Uruguaiana	RS
1	1654	Uniao da Vitoria	AV MANOEL RIBAS, 332	CENTRO	84600-280	Uniao da Vitoria	PR
1	1247	Uruguaiana 12	RUA DR MAIA, 4237.	SÃO JOÃO	97502-295	Uruguaiana	RS
1	1266	Uruguaiana 13	AV MAL SETEMBRINO DE CARVALHO-S MIGUEL, 176.	VILA JULIA	97502-860	Uruguaiana	RS
1	1284	Uruguaiana 14	RUA 15 DE NOVEMBRO, 2444.	CENTRO	97501-714	Uruguaiana	RS
1	74	Uruguaiana 2	RUA GAL. BENTO MARTINS, 2954	CENTRO	97501636	Uruguaiana	RS
1	165	Uruguaiana 3	RUA DOMINGOS DE ALMEIDA, 1780	CENTRO	97501516	Uruguaiana	RS
1	262	Uruguaiana 4	R. DUQUE DE CAXIAS, 1655	CENTRO	97501-523	Uruguaiana	RS
1	843	Uruguaiana 5	RUA DUQUE DE CAXIAS, 3476.	SÃO MIGUEL	97502-810	Uruguaiana	RS
1	412	Uruguaiana 6	RUA BENJAMIN CONSTAT, 2875.	SÃO JOÃO	97502598	Uruguaiana	RS
1	421	Uruguaiana 7	AV. PRESIDENTE GETÚLIO VARGAS, 3752	SANTANA	97502-374	Uruguaiana	RS
1	439	Uruguaiana 8	RUA PINHEIRO MACHADO, 1623.	CABO LUIS QUEVEDO	97503-850	Uruguaiana	RS
1	655	Uruguaiana 9	RUA SANTOS DUMONT, 460.	RUI RAMOS	97507-001	Uruguaiana	RS
1	24	Vacaria 1	R. MAL. FLORIANO, 375 - SALA 1	CENTRO	95200-037	Vacaria	RS
1	35	Vacaria 2	RUA RAMIRO BARCELOS, 1108	CENTRO	95200-000	Vacaria	RS
1	72	Vacaria 3	AV. MOREIRA PAZ, 457- LOJA 1	CENTRO	95200-000	Vacaria	RS
1	82	Vacaria 4	R JÚLIO DE CASTILHOS, 1545	CENTRO	95200-094	Vacaria	RS
1	280	Vacaria 5	AV. MILITAR, 2032 - LOJA 01	JARDIM AMÉRICA	95214-086	Vacaria	RS
1	365	Vacaria 6	RUA BORGES DE MEDEIROS, 1158.	CENTRO	95200-055	Vacaria	RS
1	456	Vacaria 7	AV MAJOR SAMUEL GUAZZELLI, 668.	PETROPOLIS	95200-164	Vacaria	RS
1	913	Vacaria 8	RUA DR. FLORES, 583	CENTRO	95200-103	Vacaria	RS
1	1602	Vacaria 10	RUA BORGES DE MEDEIROS - GLORIA, 2359	GLORIA	95200-103	Vacaria	RS
1	122	Venancio Aires 1	RUA OSVALDO ARANHA, 935	CENTRO	95800-000	Venancio Aires	RS
1	242	Venancio Aires 2	R OSVALDO ARANHA, 1234	CENTRO	95800-000	Venancio Aires	RS
1	396	Venancio Aires 3	RUA OSVALDO ARANHA, 1713	CENTRO	95800000	Venancio Aires	RS
1	443	Venancio Aires 4	RUA OSVALDO ARANHA, 219	CENTRO	95800-000	Venancio Aires	RS
1	1652	Venancio Aires 5 Nova	RUA GEN OSORIO, 880	CENTRO	95800-000	Venancio Aires	RS
1	678	Venancio Aires 6	R DOUTOR ARMANDO RUSCHEL, 1086.	GRESSLER	95800-000	Venancio Aires	RS
1	782	Venancio Aires 8	RUA TIRADENTES, 1108.	CRUZEIRO	95800-000	Venancio Aires	RS
1	1242	Vera Cruz	AV NESTOR FREDERICO HENN, 1914.	CENTRO	96880-000	Vera Cruz	RS
1	1353	Vera Cruz 2	RUA ROBERTO GRUENDLING, 66.	CENTRO	96880-000	Vera Cruz	RS
1	4	Veranopolis 1	AV. JÚLIO DE CASTILHOS, 795	CENTRO	95330-000	Veranopolis	RS
1	354	Veranopolis 2	AV OSVALDO ARANHA, 515	CENTRO	95330-000	Veranopolis	RS
1	1279	Veranopolis 3	AVENIDA OSVALDO ARANHA, 1419.	PALUGANA	95330-000	Veranopolis	RS
1	154	Viamao 1	RUA AMÉRICO VESPÚCIO CABRAL,667 SL 1 ESQUINA	CENTRO	94410-300	Viamao	RS
1	1159	Viamao 11	AV PLACIDO MOTTIN, 1110.	CECILIA	94475-500	Viamao	RS
1	1228	Viamao 12	RUA JULIETA PINTO CESAR, 276.	CENTRO	94410-080	Viamao	RS
1	1362	Viamao 13	ROD TAPIR ROCHA, 7277.	QUERENCIA	94440-000	Viamao	RS
1	186	Viamao 2	AV. LIBERDADE, 1589 LJ A	CENTRO	94480-500	Viamao	RS
1	382	Viamao 4	AV. LIBERDADE, 1825	STA ISABEL	94480-500	Viamao	RS
1	588	Viamao 5	AV CORONEL MARCOS DE ANDRADE, 99.	CENTRO	94410-050	Viamao	RS
1	783	Viamao 6	RUA ISABEL BASTOS, 253.	CENTRO	94410-250	Viamao	RS
1	1013	Viamao 7	ROD RS040 TAPIR DA ROCHA, 19417	FAZENDA COUNTRY CLUB	94760-000	Viamao	RS
1	1041	Viamao 9	AV SENADOR SALGADO FILHO, 3095.	VIAMOPOLIS	94470-000	Viamao	RS
1	202	Videira 1	RUA SAUL BRANDALISE, 120 – LOJA 01	CENTRO	89560-194	Videira	SC
1	676	Videira 2	RUA 15 DE NOVEMBRO, 250.	CENTRO	89560-132	Videira	SC
1	1044	Videira 3	RUA FRAIBURGO, 1700.	DOIS PINHEIROS	89562-174	Videira	SC
1	413	Xangri - La 1 - Merc	ROD. RS 407	GUARA	95588000	Xangri -la	RS
1	586	Xangri - La 2	AV PARAGUASSU, 1151.	CENTRO	95588-000	Xangri -la	RS
1	1092	Xangri - La 4 - Merc	AV PARAGUASSU, 801.	NOIVA DO MAR	95588-000	Xangri -la	RS
1	1516	Xangri - La 6	AV PARAGUASSU, 1595	CENTRO	95588-000	Xangri -la	RS
1	1559	Xangri - La 7	AV PARAGUASSU, 4588	ATLANTIDA	95588-000	Xangri -la	RS
1	1147	Xangri - La 5 - Merc	RUA RIO JACUI, 1035.	CENTRO	95588-000	Xangri -la	RS
`;

// =========================
// 2) FUNCOES AUXILIARES
// =========================
function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

function formatCEP(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeText(text: string) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function money(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =========================
// 3) TIPOS
// =========================
type StoreRecord = {
  id: number;
  code: string;
  name: string;
  address: string;
  district: string;
  zip: string;
  city: string;
  state: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
};

type CustomerLocation = {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
};

// =========================
// 4) PARSE DA BASE BRUTA
// =========================
function parseStoresFromTSV(raw: string): StoreRecord[] {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const dataLines = lines.slice(1);
  const stores: StoreRecord[] = [];

  for (const line of dataLines) {
    const cols = line.split("\t").map((col) => col.trim());

    if (cols.length < 8) continue;

    const code = cols[1] || "";
    const name = cols[2] || "";
    const address = cols[3] || "";
    const district = cols[4] || "";
    const zip = formatCEP(cols[5] || "");
    const city = cols[6] || "";
    const state = cols[7] || "";

    if (!code || !name || !city || !state) continue;

    stores.push({
      id: Number(code),
      code,
      name,
      address,
      district,
      zip,
      city,
      state,
      fullAddress: `${address}, ${district}, ${city}, ${state}, Brasil`,
    });
  }

  const map = new Map<string, StoreRecord>();
  for (const store of stores) {
    if (!map.has(store.code)) map.set(store.code, store);
  }

  return Array.from(map.values());
}

// =========================
// 5) VIACEP + GEOCODING
// =========================
async function fetchAddressByCEP(cep: string): Promise<CustomerLocation> {
  const clean = onlyDigits(cep);
  if (clean.length !== 8) throw new Error("CEP inválido");

  const viaCepResponse = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  const viaCepData = await viaCepResponse.json();

  if (viaCepData.erro) throw new Error("CEP não encontrado");

  const query = encodeURIComponent(
    `${viaCepData.logradouro || ""}, ${viaCepData.bairro || ""}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`
  );

  const geoResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${query}`,
    { headers: { "Accept-Language": "pt-BR" } }
  );

  const geoData = await geoResponse.json();

  if (!geoData?.length) {
    const cityQuery = encodeURIComponent(`${viaCepData.localidade}, ${viaCepData.uf}, Brasil`);
    const cityGeoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${cityQuery}`,
      { headers: { "Accept-Language": "pt-BR" } }
    );
    const cityGeoData = await cityGeoResponse.json();

    if (!cityGeoData?.length) {
      throw new Error("Não foi possível localizar o CEP no mapa");
    }

    return {
      cep: viaCepData.cep,
      street: viaCepData.logradouro || "",
      district: viaCepData.bairro || "",
      city: viaCepData.localidade || "",
      state: viaCepData.uf || "",
      lat: Number(cityGeoData[0].lat),
      lng: Number(cityGeoData[0].lon),
    };
  }

  return {
    cep: viaCepData.cep,
    street: viaCepData.logradouro || "",
    district: viaCepData.bairro || "",
    city: viaCepData.localidade || "",
    state: viaCepData.uf || "",
    lat: Number(geoData[0].lat),
    lng: Number(geoData[0].lon),
  };
}

async function geocodeAddress(fullAddress: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(fullAddress);

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${query}`,
    { headers: { "Accept-Language": "pt-BR" } }
  );

  const data = await response.json();
  if (!data?.length) return null;

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  };
}

// =========================
// 6) CACHE LOCAL DAS COORDENADAS
// =========================
const STORE_GEO_CACHE_KEY = "sj_store_geo_cache_v1";

function loadStoreGeoCache(): Record<string, { lat: number; lng: number }> {
  try {
    const raw = localStorage.getItem(STORE_GEO_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoreGeoCache(cache: Record<string, { lat: number; lng: number }>) {
  localStorage.setItem(STORE_GEO_CACHE_KEY, JSON.stringify(cache));
}

// =========================
// 7) ENRIQUECER LOJAS COM LAT/LNG
// =========================
async function enrichStoresWithGeo(stores: StoreRecord[], onProgress?: (done: number, total: number) => void) {
  const cache = loadStoreGeoCache();
  const total = stores.length;
  let done = 0;

  const enriched: StoreRecord[] = [];

  for (const store of stores) {
    const cacheKey = `${store.code}-${normalizeText(store.fullAddress)}`;

    if (cache[cacheKey]) {
      enriched.push({
        ...store,
        lat: cache[cacheKey].lat,
        lng: cache[cacheKey].lng,
      });
      done++;
      onProgress?.(done, total);
      continue;
    }

    const geo = await geocodeAddress(store.fullAddress);

    if (geo) {
      cache[cacheKey] = geo;
      saveStoreGeoCache(cache);

      enriched.push({
        ...store,
        lat: geo.lat,
        lng: geo.lng,
      });
    } else {
      enriched.push(store);
    }

    done++;
    onProgress?.(done, total);

    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  return enriched;
}

// =========================
// 8) CALCULO DE PROMESSA
// =========================
interface DeliveryOption {
  id: string;
  label: string;
  subtitle: string;
  price: number;
  available: boolean;
  origin: string;
  originCode: string;
  distanceKm: number | null;
  etaText: string;
  tag: string;
}

interface RankedStore extends StoreRecord {
  distanceKm: number;
  pickingMinutes: number;
  sameDayMinutes: number;
  expressMinutes: number;
  normalPrice: number;
  expressPrice: number;
  score: number;
}

interface EstimateResult {
  bestStore: RankedStore;
  rankedStores: RankedStore[];
  options: DeliveryOption[];
}

function estimateOptions(customer: CustomerLocation, stores: StoreRecord[]): EstimateResult {
  const validStores = stores.filter((s) => typeof s.lat === "number" && typeof s.lng === "number");

  const ranked: RankedStore[] = validStores
    .map((store) => {
      const distanceKm = haversineDistanceKm(customer.lat, customer.lng, store.lat!, store.lng!);

      const pickingMinutes = Math.max(8, Math.min(25, Math.round(8 + distanceKm * 0.8)));
      const deliveryMinutes = Math.max(8, Math.round(distanceKm * 4.2));
      const sameDayMinutes = pickingMinutes + deliveryMinutes;
      const expressMinutes = Math.max(20, Math.round(pickingMinutes * 0.7 + deliveryMinutes * 0.75));

      const normalPrice = Number((6.9 + distanceKm * 1.15).toFixed(2));
      const expressPrice = Number((12.9 + distanceKm * 1.35).toFixed(2));

      return {
        ...store,
        distanceKm,
        pickingMinutes,
        sameDayMinutes,
        expressMinutes,
        normalPrice,
        expressPrice,
        score: distanceKm + pickingMinutes / 10,
      };
    })
    .sort((a, b) => a.score - b.score);

  const bestStore = ranked[0];

  if (!bestStore) {
    throw new Error("Nenhuma loja geocodificada disponível");
  }

  const options: DeliveryOption[] = [
    {
      id: "express",
      label: "Receber agora",
      subtitle: `Entrega estimada em ${bestStore.expressMinutes} min`,
      price: bestStore.expressPrice,
      available: true,
      origin: bestStore.name,
      originCode: bestStore.code,
      distanceKm: bestStore.distanceKm,
      etaText: `${bestStore.expressMinutes} min`,
      tag: "Mais rápido",
    },
    {
      id: "same_day",
      label: "Receber hoje",
      subtitle: `Entrega estimada em ${bestStore.sameDayMinutes} min`,
      price: bestStore.normalPrice,
      available: true,
      origin: bestStore.name,
      originCode: bestStore.code,
      distanceKm: bestStore.distanceKm,
      etaText: `${bestStore.sameDayMinutes} min`,
      tag: "Melhor equilíbrio",
    },
    {
      id: "integral",
      label: "Receber pedido integral",
      subtitle: "Consolida itens e entrega em até 3 dias",
      price: 0,
      available: true,
      origin: "Centro de distribuição / consolidação",
      originCode: "CD",
      distanceKm: null,
      etaText: "até 3 dias",
      tag: "Menor custo",
    },
  ];

  return {
    bestStore,
    rankedStores: ranked.slice(0, 12),
    options,
  };
}

// =========================
// 9) COMPONENTE PRINCIPAL
// =========================
export default function PromiseEngineAllStores() {
  const parsedStores = useMemo(() => parseStoresFromTSV(RAW_STORES_TSV), []);

  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoProgress, setGeoProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState<CustomerLocation | null>(null);
  const [stores, setStores] = useState<StoreRecord[]>(parsedStores);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const selectedData = useMemo(
    () => result?.options?.find((option) => option.id === selectedOption) || null,
    [result, selectedOption]
  );

  async function handlePrepareStoreCoordinates() {
    try {
      setGeoLoading(true);
      setError("");
      const enriched = await enrichStoresWithGeo(parsedStores, (done, total) => {
        setGeoProgress({ done, total });
      });
      setStores(enriched);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao geocodificar lojas");
    } finally {
      setGeoLoading(false);
    }
  }

  async function handleSearch() {
    try {
      setLoading(true);
      setError("");
      setCustomer(null);
      setResult(null);
      setSelectedOption(null);

      const customerAddress = await fetchAddressByCEP(cep);
      const calculation = estimateOptions(customerAddress, stores);

      setCustomer(customerAddress);
      setResult(calculation);
      setSelectedOption(calculation.options[0].id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao consultar CEP");
    } finally {
      setLoading(false);
    }
  }

  const geocodedCount = stores.filter((s) => s.lat && s.lng).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Promise Engine / Loja mais próxima</p>
              <h1 className="text-2xl font-bold text-slate-900">
                Escolha de origem por CEP com base completa de lojas
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Base carregada: <strong>{parsedStores.length}</strong> lojas
              </p>
              <p className="text-sm text-slate-500">
                Lojas com coordenadas em cache: <strong>{geocodedCount}</strong>
              </p>
            </div>

            <div className="flex w-full max-w-2xl flex-col gap-3">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    placeholder="Digite o CEP do cliente"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search className="h-4 w-4" />
                  {loading ? "Consultando..." : "Buscar"}
                </button>
              </div>

              <button
                onClick={handlePrepareStoreCoordinates}
                disabled={geoLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${geoLoading ? "animate-spin" : ""}`} />
                {geoLoading ? "Geocodificando lojas..." : "Preparar coordenadas das lojas"}
              </button>

              {geoLoading && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Processando {geoProgress.done} de {geoProgress.total} lojas...
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {customer && result && (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Destino do cliente</p>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {customer.street ? `${customer.street}, ` : ""}
                      {customer.district ? `${customer.district} - ` : ""}
                      {customer.city}/{customer.state}
                    </h2>
                    <p className="text-sm text-slate-500">CEP {customer.cep}</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                    <p className="text-xs font-medium text-emerald-700">Melhor origem</p>
                    <p className="text-base font-bold text-emerald-900">{result.bestStore.name}</p>
                    <p className="text-xs text-emerald-700">{result.bestStore.distanceKm.toFixed(1)} km</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {result.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`rounded-3xl border p-5 text-left transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-xs font-medium ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                              {option.tag}
                            </p>
                            <h3 className="text-lg font-bold">{option.label}</h3>
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5" />}
                        </div>

                        <p className={`text-sm ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                          {option.subtitle}
                        </p>

                        <div className="mt-5">
                          <p className="text-2xl font-bold">{money(option.price)}</p>
                          <p className={`mt-2 text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            Origem: {option.origin}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">Resumo da escolha</p>

                {selectedData ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">Modalidade selecionada</p>
                      <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedData.label}</h3>
                      <p className="mt-1 text-sm text-slate-500">{selectedData.subtitle}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                        <span className="text-slate-500">Origem</span>
                        <span className="font-semibold text-slate-900">{selectedData.origin}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                        <span className="text-slate-500">Prazo</span>
                        <span className="font-semibold text-slate-900">{selectedData.etaText}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                        <span className="text-slate-500">Frete</span>
                        <span className="font-semibold text-slate-900">{money(selectedData.price)}</span>
                      </div>

                      {selectedData.distanceKm !== null && (
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                          <span className="text-slate-500">Distância</span>
                          <span className="font-semibold text-slate-900">
                            {selectedData.distanceKm.toFixed(1)} km
                          </span>
                        </div>
                      )}
                    </div>

                    <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white hover:opacity-90">
                      <Package className="h-4 w-4" />
                      Confirmar opção
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Selecione uma opção para ver o resumo.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-500">Ranking de origens</p>
                <h2 className="text-lg font-semibold text-slate-900">Lojas mais próximas para o CEP informado</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.rankedStores.map((store, index) => (
                  <div key={store.code} className="rounded-3xl border border-slate-200 p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-blue-600">#{index + 1} prioridade</p>
                        <h3 className="text-base font-bold text-slate-900">{store.name}</h3>
                        <p className="text-sm text-slate-500">{store.city}/{store.state}</p>
                      </div>
                      <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                        {store.distanceKm.toFixed(1)} km
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>{store.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bike className="h-4 w-4" />
                        <span>Express: {money(store.expressPrice)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Hoje: {store.sameDayMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{store.zip}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
