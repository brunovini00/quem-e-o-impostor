// Fonte editorial própria. Execute para regravar os JSONs; não gera combinações
// ou variantes automaticamente. Cada item abaixo é uma entrada escolhida.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const definitions = [
  [
    'comidas',
    'Comidas e pratos',
    '🍲',
    'Receitas, refeições e sabores para compartilhar.',
    {
      easy: `Arroz|Feijão|Macarrão|Lasanha|Pizza|Hambúrguer|Cachorro-quente|Batata frita|Purê de batata|Omelete|Ovo mexido|Ovo frito|Sopa|Caldo verde|Salada|Churrasco|Feijoada|Strogonoff|Panqueca|Risoto|Bife à milanesa|Frango assado|Peixe frito|Arroz de forno|Escondidinho|Carne de panela|Almôndega|Torta de frango|Empadão|Pastel|Coxinha|Empada|Quibe|Esfiha|Pão de queijo|Pão francês|Pão de forma|Pão integral|Torrada|Sanduíche|Misto-quente|Bauru|Tapioca|Cuscuz|Farofa|Pipoca|Bolo de chocolate|Bolo de cenoura|Brigadeiro|Beijinho|Pudim|Sorvete|Picolé|Gelatina|Mousse de maracujá|Arroz-doce|Canjica|Paçoca|Pé de moleque|Doce de leite|Goiabada|Cocada|Biscoito|Bolacha recheada|Sonho|Churros|Rabanada|Panetone|Croissant|Rosquinha`,
      medium: `Acarajé|Vatapá|Moqueca|Bobó de camarão|Baião de dois|Arroz carreteiro|Galinhada|Vaca atolada|Barreado|Tutu de feijão|Feijão-tropeiro|Pirão|Pamonha|Curau|Polenta|Nhoque|Ravióli|Capeletti|Canelone|Yakissoba|Sushi|Sashimi|Temaki|Guioza|Lámen|Tempurá|Falafel|Homus|Tabule|Shawarma|Taco|Burrito|Nachos|Guacamole|Paella|Bacalhau à Gomes de Sá|Ceviche|Quiche|Fondue|Crepe|Waffle|Brownie|Cheesecake|Tiramisù|Pavê|Banoffee|Petit gâteau|Quindim|Manjar|Sagu|Ambrosia|Queijadinha|Romeu e Julieta|Torta holandesa|Salpicão|Maionese de batata|Bolinho de chuva|Bolinho de bacalhau|Casquinha de siri|Rocambole`,
    },
  ],
  [
    'bebidas',
    'Bebidas',
    '🥤',
    'Do café da manhã ao brinde da festa.',
    {
      easy: `Água|Água com gás|Água de coco|Água tônica|Refrigerante|Guaraná|Limonada|Limonada suíça|Suco de laranja|Suco de uva|Suco de maçã|Suco de abacaxi|Suco de maracujá|Suco de manga|Suco de goiaba|Suco de melancia|Suco de acerola|Suco de caju|Suco de limão|Suco de morango|Suco de pêssego|Suco de tomate|Suco verde|Caldo de cana|Café|Café com leite|Café expresso|Café descafeinado|Cappuccino|Chocolate quente|Achocolatado|Leite|Leite de soja|Leite de amêndoas|Leite de aveia|Leite de coco|Iogurte líquido|Leite fermentado|Vitamina de banana|Vitamina de abacate|Vitamina de mamão|Milk-shake|Chá gelado|Chá de camomila|Chá de hortelã|Chá de erva-doce|Chá de erva-cidreira|Chá de boldo|Chá preto|Chá verde|Chá-mate|Chimarrão|Tereré|Energético|Isotônico|Cerveja|Chope|Vinho tinto|Vinho branco|Espumante|Champanhe|Sidra|Caipirinha|Batida de coco|Quentão|Vinho quente|Licor|Cachaça|Vodca|Uísque`,
      medium: `Rum|Gim|Tequila|Conhaque|Saquê|Vermute|Vinho rosé|Vinho do Porto|Cerveja sem álcool|Hidromel|Kombucha|Kefir|Smoothie|Frapê|Frappuccino|Mocha|Latte|Macchiato|Café americano|Café turco|Café coado|Café gelado|Cold brew|Affogato|Irish coffee|Chá de hibisco|Chá de gengibre|Chá de jasmim|Chá branco|Matcha|Bubble tea|Chai latte|Ponche|Sangria|Clericot|Mojito|Piña colada|Daiquiri|Margarita|Cosmopolitan|Dry martini|Negroni|Aperol spritz|Bloody Mary|Cuba libre|Gin-tônica|Caipirosca|Pisco sour|Alexander|Bellini|Mimosa|Caju amigo|Rabo de galo|Amarula|Aperitivo|Lassi|Groselha|Orzata|Refresco|Aluá`,
    },
  ],
  [
    'ingredientes',
    'Frutas, verduras e ingredientes',
    '🥕',
    'Da feira à despensa da cozinha.',
    {
      easy: `Maçã|Banana|Laranja|Limão|Morango|Uva|Abacaxi|Melancia|Melão|Mamão|Manga|Pera|Pêssego|Ameixa|Cereja|Kiwi|Abacate|Maracujá|Goiaba|Caju|Acerola|Coco|Jabuticaba|Pitanga|Tangerina|Caqui|Figo|Jaca|Framboesa|Amora|Mirtilo|Romã|Alface|Tomate|Cenoura|Batata|Batata-doce|Mandioca|Beterraba|Cebola|Alho|Pepino|Abobrinha|Berinjela|Abóbora|Chuchu|Brócolis|Couve-flor|Couve|Repolho|Espinafre|Rúcula|Agrião|Vagem|Ervilha|Milho|Pimentão|Quiabo|Salsinha|Cebolinha|Coentro|Manjericão|Hortelã|Alecrim|Orégano|Louro|Gengibre|Pimenta-do-reino|Pimenta|Sal|Açúcar|Farinha de trigo|Fubá|Amido de milho|Fermento|Óleo|Azeite|Vinagre|Manteiga|Margarina`,
      medium: `Açaí|Cupuaçu|Graviola|Carambola|Lichia|Tamarindo|Physalis|Damasco|Tâmara|Nectarina|Pitaya|Seriguela|Umbu|Pequi|Inhame|Cará|Nabo|Rabanete|Alho-poró|Salsão|Aspargo|Alcachofra|Endívia|Escarola|Chicória|Palmito|Brotos de feijão|Grão-de-bico|Lentilha|Soja|Quinoa|Aveia|Cevada|Centeio|Arroz integral|Feijão-preto|Feijão-branco|Castanha-do-pará|Castanha de caju|Noz|Amêndoa|Avelã|Pistache|Amendoim|Gergelim|Linhaça|Chia|Semente de abóbora|Canela|Cravo-da-índia|Noz-moscada|Cominho|Cúrcuma|Páprica|Curry|Tomilho|Sálvia|Mostarda|Ketchup|Maionese|Molho de soja|Molho inglês|Extrato de tomate|Creme de leite|Leite condensado|Requeijão|Ricota|Muçarela|Parmesão|Gorgonzola|Chocolate em pó|Cacau|Baunilha|Mel|Melado|Gelatina sem sabor|Cogumelo|Champignon|Shiitake|Shimeji`,
    },
  ],
  [
    'animais',
    'Animais',
    '🐾',
    'Bichos de casa, do campo, do mar e da floresta.',
    {
      easy: `Cachorro|Gato|Cavalo|Burro|Vaca|Boi|Touro|Porco|Cabra|Ovelha|Coelho|Galinha|Galo|Pinto|Pato|Ganso|Peru|Pombo|Papagaio|Periquito|Canário|Calopsita|Hamster|Porquinho-da-índia|Rato|Camundongo|Morcego|Raposa|Lobo|Urso|Panda|Leão|Tigre|Onça|Leopardo|Guepardo|Elefante|Girafa|Zebra|Hipopótamo|Rinoceronte|Macaco|Gorila|Chimpanzé|Orangotango|Canguru|Coala|Preguiça|Tamanduá|Tatu|Capivara|Anta|Veado|Alce|Búfalo|Camelo|Dromedário|Lhama|Alpaca|Esquilo|Castor|Lontra|Ariranha|Guaxinim|Gambá|Ouriço|Furão|Doninha|Suricato|Hiena`,
      medium: `Javali|Mico-leão-dourado|Lobo-guará|Quati|Cutia|Paca|Foca|Leão-marinho|Morsa|Baleia|Golfinho|Orca|Peixe-boi|Tubarão|Arraia|Peixe-palhaço|Cavalo-marinho|Piranha|Salmão|Atum|Sardinha|Bacalhau|Tilápia|Bagre|Enguia|Linguado|Baiacu|Tucunaré|Pirarucu|Polvo|Lula|Água-viva|Estrela-do-mar|Ouriço-do-mar|Caranguejo|Siri|Lagosta|Camarão|Ostra|Mexilhão|Caracol|Lesma|Sapo|Rã|Perereca|Salamandra|Jacaré|Crocodilo|Tartaruga|Jabuti|Cágado|Iguana|Camaleão|Lagartixa|Dragão-de-komodo|Jiboia|Sucuri|Cascavel|Naja|Coral|Águia|Falcão|Gavião|Coruja|Urubu|Tucano|Arara|Flamingo|Pinguim|Avestruz|Ema|Pavão|Garça|Cegonha|Pelicano|Beija-flor|Pica-pau|Sabiá|Bem-te-vi|João-de-barro|Borboleta|Mariposa|Abelha|Vespa|Formiga|Cupim|Mosquito|Mosca|Besouro|Joaninha|Libélula|Grilo|Gafanhoto|Louva-a-deus|Barata|Aranha|Escorpião|Minhoca|Centopeia|Lacraia`,
    },
  ],
  [
    'objetos',
    'Objetos do cotidiano',
    '🔑',
    'Coisas que aparecem no dia a dia.',
    {
      easy: `Chave|Chaveiro|Carteira|Bolsa|Mochila|Sacola|Guarda-chuva|Óculos|Relógio|Celular|Carregador|Fone de ouvido|Controle remoto|Pilha|Bateria|Lanterna|Lâmpada|Vela|Isqueiro|Fósforo|Tesoura|Faca|Garfo|Colher|Prato|Copo|Caneca|Xícara|Garrafa|Jarra|Pote|Panela|Frigideira|Assadeira|Tampa|Escorredor|Peneira|Ralador|Funil|Concha|Espátula|Pegador|Abridor de latas|Saca-rolhas|Tábua de corte|Rolha|Guardanapo|Toalha|Pano de prato|Esponja|Vassoura|Rodo|Balde|Pá de lixo|Lixeira|Saco de lixo|Prendedor de roupa|Cabide|Cesto|Escova de dentes|Pasta de dentes|Fio dental|Pente|Escova de cabelo|Sabonete|Saboneteira|Shampoo|Desodorante|Perfume|Papel higiênico`,
      medium: `Algodão|Cotonete|Curativo|Termômetro|Cortador de unha|Lixa de unha|Pinça|Navalha|Barbeador|Maquiagem|Espelho de bolso|Caneta|Lápis|Borracha|Apontador|Régua|Caderno|Agenda|Calendário|Livro|Marcador de página|Envelope|Selo|Clipes|Grampeador|Grampo|Cola|Fita adesiva|Fita isolante|Elástico|Barbante|Corda|Agulha|Linha|Dedal|Alfinete|Botão|Zíper|Martelo|Prego|Parafuso|Chave de fenda|Alicate|Trena|Estilete|Serrote|Furadeira|Cadeado|Mosquetão|Bússola|Apito|Sino|Ampulheta|Lupa|Binóculo|Tripé|Balança|Sacola térmica|Garrafa térmica|Borrifador|Regador|Mangueira|Desentupidor|Extensão elétrica|Adaptador de tomada|Pen drive|Carimbo|Calculadora|Porta-retrato|Cinzeiro`,
    },
  ],
  [
    'profissoes',
    'Profissões',
    '🛠️',
    'Trabalhos e ofícios de muitas áreas.',
    {
      easy: `Professor|Médico|Enfermeiro|Dentista|Veterinário|Farmacêutico|Psicólogo|Nutricionista|Fisioterapeuta|Bombeiro|Policial|Guarda municipal|Carteiro|Motorista|Taxista|Caminhoneiro|Motoboy|Piloto|Comissário de bordo|Maquinista|Marinheiro|Pescador|Agricultor|Pecuarista|Jardineiro|Pedreiro|Carpinteiro|Marceneiro|Eletricista|Encanador|Pintor|Mecânico|Borracheiro|Funileiro|Soldador|Serralheiro|Vidraceiro|Chaveiro|Sapateiro|Costureiro|Alfaiate|Cabeleireiro|Barbeiro|Manicure|Esteticista|Maquiador|Cozinheiro|Chef de cozinha|Padeiro|Confeiteiro|Açougueiro|Garçom|Barista|Barman|Vendedor|Caixa|Repositor|Estoquista|Gerente|Recepcionista|Secretário|Porteiro|Zelador|Vigilante|Faxineiro|Gari|Babá|Cuidador de idosos|Guia de turismo|Tradutor`,
      medium: `Intérprete|Jornalista|Repórter|Apresentador|Radialista|Locutor|Fotógrafo|Cinegrafista|Editor de vídeo|Diretor de cinema|Roteirista|Ator|Dublador|Cantor|Músico|Compositor|Maestro|Dançarino|Coreógrafo|Artista plástico|Escultor|Ilustrador|Designer gráfico|Arquiteto|Urbanista|Engenheiro civil|Engenheiro de software|Programador|Analista de sistemas|Técnico em informática|Técnico de som|Técnico de enfermagem|Técnico de laboratório|Bibliotecário|Historiador|Geógrafo|Biólogo|Químico|Físico|Matemático|Pesquisador|Astrônomo|Meteorologista|Arqueólogo|Geólogo|Oceanógrafo|Advogado|Juiz|Promotor de justiça|Defensor público|Contador|Economista|Administrador|Corretor de imóveis|Corretor de seguros|Bancário|Auditor|Perito criminal|Delegado|Diplomata|Agente de viagens|Organizador de eventos|Cerimonialista|Produtor cultural|Atleta|Treinador|Árbitro|Salva-vidas|Mergulhador|Instrutor de autoescola|Personal trainer|Terapeuta ocupacional|Fonoaudiólogo|Assistente social|Pedagogo|Optometrista|Tosador|Adestrador|Apicultor|Silvicultor`,
    },
  ],
  [
    'lugares',
    'Lugares e pontos turísticos',
    '🗺️',
    'Destinos famosos e espaços para explorar.',
    {
      easy: `Praia|Parque|Praça|Jardim botânico|Zoológico|Aquário|Museu|Biblioteca|Cinema|Teatro|Estádio|Shopping|Feira|Mercado|Restaurante|Cafeteria|Padaria|Sorveteria|Hotel|Pousada|Resort|Acampamento|Aeroporto|Rodoviária|Estação de trem|Porto|Hospital|Escola|Universidade|Igreja|Catedral|Mosteiro|Castelo|Palácio|Fazenda|Sítio|Chácara|Floresta|Cachoeira|Montanha|Mirante|Caverna|Ilha|Lago|Rio|Deserto|Vulcão|Farol|Ponte|Túnel|Cristo Redentor|Pão de Açúcar|Copacabana|Ipanema|Maracanã|Escadaria Selarón|Arcos da Lapa|Jardim Botânico do Rio|Parque Ibirapuera|Avenida Paulista|MASP|Mercado Municipal de São Paulo|Catedral da Sé|Beco do Batman|Pelourinho|Elevador Lacerda|Farol da Barra|Praia do Forte|Porto de Galinhas|Praia de Boa Viagem`,
      medium: `Fernando de Noronha|Lençóis Maranhenses|Jericoacoara|Canoa Quebrada|Cataratas do Iguaçu|Parque das Aves|Jalapão|Chapada Diamantina|Chapada dos Veadeiros|Chapada dos Guimarães|Monte Roraima|Encontro das Águas|Teatro Amazonas|Ver-o-Peso|Alter do Chão|Ilha do Marajó|Maragogi|Praia de Pipa|Dunas de Genipabu|Praia de Tambaba|Serra do Cipó|Parque Nacional do Itatiaia|Serra da Capivara|Serra do Rio do Rastro|Cânion do Itaimbezinho|Ilha do Campeche|Praia da Joaquina|Lago Negro|Vale dos Vinhedos|Lago de Furnas|Gruta do Lago Azul|Praça dos Três Poderes|Congresso Nacional|Catedral de Brasília|Santuário de Aparecida|Inhotim|Torre Eiffel|Museu do Louvre|Arco do Triunfo|Catedral de Notre-Dame|Palácio de Versalhes|Coliseu|Torre de Pisa|Fontana di Trevi|Basílica de São Pedro|Big Ben|Palácio de Buckingham|London Eye|Stonehenge|Sagrada Família|Alhambra|Torre de Belém|Mosteiro dos Jerónimos|Acrópole de Atenas|Grande Muralha da China|Cidade Proibida|Taj Mahal|Petra|Pirâmides de Gizé|Monte Fuji|Angkor Wat|Burj Khalifa|Estátua da Liberdade|Times Square|Central Park|Ponte Golden Gate|Grand Canyon|Parque Yellowstone|Hollywood|Walt Disney World|Chichén Itzá|Machu Picchu|Ilha de Páscoa|Deserto do Atacama|Salar de Uyuni|Glaciar Perito Moreno|Ópera de Sydney|Grande Barreira de Corais|Monte Kilimanjaro|Cataratas Vitória`,
    },
  ],
  [
    'paises-cidades',
    'Países, cidades e culturas',
    '🌎',
    'Nomes do mapa e tradições pelo mundo.',
    {
      easy: `Brasil|Argentina|Uruguai|Paraguai|Chile|Bolívia|Peru|Equador|Colômbia|Venezuela|México|Estados Unidos|Canadá|Cuba|Portugal|Espanha|França|Itália|Alemanha|Reino Unido|Irlanda|Suíça|Áustria|Bélgica|Países Baixos|Suécia|Noruega|Dinamarca|Finlândia|Islândia|Grécia|Turquia|Rússia|Ucrânia|Polônia|Japão|China|Coreia do Sul|Índia|Tailândia|Indonésia|Austrália|Nova Zelândia|Egito|Marrocos|África do Sul|Angola|Moçambique|São Paulo|Rio de Janeiro|Salvador|Brasília|Fortaleza|Recife|Belo Horizonte|Curitiba|Porto Alegre|Manaus|Belém|Florianópolis|Natal|João Pessoa|Maceió|Aracaju|Teresina|São Luís|Vitória|Goiânia|Cuiabá|Campo Grande|Palmas|Rio Branco|Porto Velho|Boa Vista|Macapá`,
      medium: `Campinas|Santos|Ribeirão Preto|Sorocaba|Ouro Preto|Tiradentes|Paraty|Petrópolis|Gramado|Canela|Foz do Iguaçu|Bonito|Olinda|Caruaru|Juazeiro do Norte|Campina Grande|Porto Seguro|Ilhéus|Santarém|São Luís do Paraitinga|Buenos Aires|Montevidéu|Santiago|Lima|Bogotá|Quito|La Paz|Assunção|Caracas|Cidade do México|Havana|Nova York|Los Angeles|Miami|Toronto|Vancouver|Lisboa|Porto|Madri|Barcelona|Paris|Lyon|Roma|Veneza|Florença|Londres|Edimburgo|Dublin|Berlim|Munique|Amsterdã|Bruxelas|Viena|Praga|Budapeste|Atenas|Istambul|Moscou|Tóquio|Quioto|Pequim|Xangai|Seul|Bangcoc|Nova Déli|Mumbai|Sydney|Melbourne|Auckland|Cairo|Marrakech|Cidade do Cabo|Nairóbi|Dubai|Jerusalém|Samba|Capoeira|Frevo|Maracatu|Bumba meu boi|Carimbó|Tango|Flamenco|Fado|Cerimônia do chá|Origami|Caligrafia japonesa|Dança do ventre|Dança irlandesa|Haka|Carnaval de Veneza|Ano-Novo Chinês|Dia dos Mortos|Festa junina|Oktoberfest|Hanami|Festa da colheita|Roda de chimarrão|Literatura de cordel|Azulejo português`,
    },
  ],
  [
    'filmes',
    'Filmes',
    '🎬',
    'Histórias marcantes das telas de cinema.',
    {
      easy: `Titanic|Avatar|Jurassic Park|O Rei Leão|Toy Story|Procurando Nemo|Shrek|Frozen|Moana|Divertida Mente|Os Incríveis|Carros|Ratatouille|Up: Altas Aventuras|WALL-E|Viva: A Vida é uma Festa|Encanto|Zootopia|Madagascar|A Era do Gelo|Kung Fu Panda|Como Treinar o Seu Dragão|Meu Malvado Favorito|Minions|Rio|A Bela e a Fera|Aladdin|A Pequena Sereia|Mulan|Pocahontas|Tarzan|Lilo & Stitch|Branca de Neve e os Sete Anões|Cinderela|A Bela Adormecida|Dumbo|Bambi|Pinóquio|Peter Pan|Alice no País das Maravilhas|101 Dálmatas|A Dama e o Vagabundo|Harry Potter e a Pedra Filosofal|O Senhor dos Anéis: A Sociedade do Anel|Star Wars: Uma Nova Esperança|Os Vingadores|Homem-Aranha|Homem de Ferro|Pantera Negra|Mulher-Maravilha|Batman: O Cavaleiro das Trevas|Superman|Aquaman|Deadpool|Guardiões da Galáxia|Barbie|Super Mario Bros. O Filme|Sonic: O Filme|Jumanji|Esqueceram de Mim|De Volta para o Futuro|E.T. — O Extraterrestre|Os Caça-Fantasmas|A Fantástica Fábrica de Chocolate|A Família Addams|O Máskara|O Grinch|Uma Noite no Museu|Click|As Branquelas`,
      medium: `Forrest Gump|O Show de Truman|À Procura da Felicidade|À Espera de um Milagre|Um Sonho de Liberdade|O Poderoso Chefão|O Pianista|A Lista de Schindler|A Vida é Bela|Sociedade dos Poetas Mortos|Gênio Indomável|O Menino do Pijama Listrado|Intocáveis|Extraordinário|Sempre ao Seu Lado|Marley & Eu|A Culpa é das Estrelas|Diário de uma Paixão|Orgulho e Preconceito|Simplesmente Amor|Uma Linda Mulher|O Diabo Veste Prada|Meninas Malvadas|De Repente 30|Legalmente Loira|Mamma Mia!|La La Land|Nasce uma Estrela|Bohemian Rhapsody|Rocketman|Whiplash|O Fabuloso Destino de Amélie Poulain|Cinema Paradiso|Central do Brasil|Cidade de Deus|Tropa de Elite|O Auto da Compadecida|Minha Mãe é uma Peça|Se Eu Fosse Você|Que Horas Ela Volta?|Bacurau|Lisbela e o Prisioneiro|O Homem que Copiava|Carandiru|Dois Filhos de Francisco|Dona Flor e Seus Dois Maridos|O Pagador de Promessas|Matrix|A Origem|Interestelar|Perdido em Marte|Duna|Blade Runner|O Exterminador do Futuro|Alien|Predador|Tubarão|O Sexto Sentido|O Iluminado|Psicose|Corra!|Jogos Vorazes|Divergente|Crepúsculo|Piratas do Caribe: A Maldição do Pérola Negra|Indiana Jones e os Caçadores da Arca Perdida|Missão: Impossível|Duro de Matar|Velozes e Furiosos|Top Gun|Gladiador|Coração Valente|Rocky|Karatê Kid|A Viagem de Chihiro|Meu Amigo Totoro|Princesa Mononoke|O Castelo Animado|O Estranho Mundo de Jack|Coraline`,
    },
  ],
  [
    'series-tv',
    'Séries e programas de TV',
    '📺',
    'Séries, novelas e atrações da televisão.',
    {
      easy: `Friends|The Big Bang Theory|How I Met Your Mother|Modern Family|Brooklyn Nine-Nine|The Office|Todo Mundo Odeia o Chris|Um Maluco no Pedaço|Eu, a Patroa e as Crianças|Seinfeld|Chaves|Chapolin|Sabrina, Aprendiz de Feiticeira|As Visões da Raven|Hannah Montana|Zack & Cody: Gêmeos em Ação|iCarly|Drake & Josh|Kenan & Kel|Brilhante Victória|Stranger Things|Wandinha|Round 6|La Casa de Papel|Game of Thrones|The Walking Dead|Breaking Bad|Lost|Prison Break|Supernatural|Smallville|The Vampire Diaries|Teen Wolf|Gossip Girl|Gilmore Girls|Grey's Anatomy|House|Plantão Médico|CSI|NCIS|Law & Order|Sherlock|Doctor Who|Black Mirror|The Crown|Bridgerton|Anne with an E|The Last of Us|The Mandalorian|Loki|A Grande Família|Os Normais|Sai de Baixo|A Diarista|Toma Lá, Dá Cá|Tapas & Beijos|Vai que Cola|Sítio do Picapau Amarelo|Castelo Rá-Tim-Bum|Mundo da Lua|Cocoricó|Bom Dia & Companhia|TV Colosso|TV Xuxa|Xou da Xuxa|Planeta Xuxa|Programa Silvio Santos|Domingão do Faustão|Domingão com Huck|Caldeirão do Huck`,
      medium: `Altas Horas|Fantástico|Globo Repórter|Globo Rural|Jornal Nacional|Jornal Hoje|Bom Dia Brasil|Roda Viva|Provoca|Manhattan Connection|Sem Censura|Mais Você|Encontro|É de Casa|Saia Justa|Conversa com Bial|Lady Night|Que História é Essa, Porchat?|The Noite|Programa do Jô|Agora É Tarde|Domingo Legal|Eliana|Programa da Sabrina|Hora do Faro|Ratinho|A Praça é Nossa|Zorra Total|Casseta & Planeta|Pânico na TV|CQC|Porta dos Fundos|Big Brother Brasil|A Fazenda|No Limite|MasterChef Brasil|The Voice Brasil|Ídolos|Popstars|Fama|Dança dos Famosos|Show dos Famosos|The Masked Singer Brasil|Bake Off Brasil|Cozinha Sob Pressão|Pesadelo na Cozinha|Quem Quer Ser um Milionário?|Show do Milhão|Passa ou Repassa|Soletrando|Qual É a Música?|Roda a Roda|Jogo dos Pontinhos|Malhação|Rebelde|Chiquititas|Carrossel|Cúmplices de um Resgate|Avenida Brasil|O Clone|Caminho das Índias|Senhora do Destino|Laços de Família|Terra Nostra|Chocolate com Pimenta|Alma Gêmea|O Cravo e a Rosa|Pantanal|Renascer|O Rei do Gado|Roque Santeiro|Vale Tudo|Tieta|Gabriela|Escrava Isaura|Cheias de Charme|Haja Coração|Totalmente Demais|Além do Tempo|A Viagem`,
    },
  ],
  [
    'desenhos',
    'Desenhos e animações',
    '🎨',
    'Desenhos animados de várias gerações.',
    {
      easy: `Tom e Jerry|Pica-Pau|Looney Tunes|Pernalonga|Popeye|Betty Boop|Os Flintstones|Os Jetsons|Scooby-Doo|Zé Colmeia|Manda-Chuva|Corrida Maluca|Os Smurfs|Garfield|Snoopy|A Pantera Cor-de-Rosa|Inspetor Bugiganga|He-Man|She-Ra|ThunderCats|Caverna do Dragão|Transformers|As Tartarugas Ninja|DuckTales|Tico e Teco: Defensores da Lei|A Turma do Pateta|Darkwing Duck|Doug|Rugrats: Os Anjinhos|Hey Arnold!|CatDog|Os Thornberrys|Rocket Power|Bob Esponja|Os Padrinhos Mágicos|Jimmy Neutron|Danny Phantom|Avatar: A Lenda de Aang|A Lenda de Korra|As Meninas Superpoderosas|O Laboratório de Dexter|Johnny Bravo|A Vaca e o Frango|Coragem, o Cão Covarde|Du, Dudu e Edu|Samurai Jack|As Terríveis Aventuras de Billy e Mandy|A Mansão Foster para Amigos Imaginários|Ben 10|Os Jovens Titãs|Hora de Aventura|Apenas um Show|O Incrível Mundo de Gumball|Steven Universo|Clarêncio, o Otimista|Ursos sem Curso|Dragon Ball|Dragon Ball Z|Pokémon|Digimon|Yu-Gi-Oh!|Naruto|One Piece|Os Cavaleiros do Zodíaco|Sailor Moon|Cardcaptor Sakura|Turma da Mônica|Peppa Pig|Patrulha Canina|Bluey`,
      medium: `Mundo Bita|Galinha Pintadinha|O Show da Luna!|Peixonauta|Irmão do Jorel|Historietas Assombradas para Crianças Malcriadas|Tromba Trem|Oswaldo|Sítio do Picapau Amarelo|Meu Amigãozão|Doki|Pocoyo|Caillou|Dora, a Aventureira|Go, Diego, Go!|As Pistas de Blue|Backyardigans|Thomas e Seus Amigos|Bob, o Construtor|Masha e o Urso|Miraculous: As Aventuras de Ladybug|Winx Club|W.I.T.C.H.|Três Espiãs Demais|Kim Possible|American Dragon: Jake Long|As Aventuras de Jackie Chan|Pepe Legal|Hora do Recreio|Os Camundongos Aventureiros|Phineas e Ferb|Gravity Falls|Star vs. as Forças do Mal|A Casa Coruja|Amphibia|Enrolados Outra Vez|Elena de Avalor|Princesinha Sofia|Doutora Brinquedos|A Casa do Mickey Mouse|Muppet Babies|Os Sete Monstrinhos|Arthur|Clifford|O Pequeno Urso|Franklin|Babar|Rupert|Blinky Bill|Bananas de Pijamas|Os Simpsons|Futurama|Bob's Burgers|Rick and Morty|BoJack Horseman|Archer|Invencível|Arcane|Castlevania|Samurai de Olhos Azuis|Death Note|Fullmetal Alchemist|Attack on Titan|Demon Slayer|Jujutsu Kaisen|My Hero Academia|Hunter x Hunter|Bleach|Yu Yu Hakusho|Inuyasha|Shaman King|Beyblade|Super Onze|Haikyu!!|Spy x Family|Sonic X|Mega Man|Kirby|Super Choque|Liga da Justiça`,
    },
  ],
  [
    'personagens',
    'Personagens fictícios',
    '🦸',
    'Heróis, vilões e figuras inesquecíveis.',
    {
      easy: `Harry Potter|Hermione Granger|Ron Weasley|Alvo Dumbledore|Lord Voldemort|Hagrid|Dobby|Frodo|Gandalf|Aragorn|Legolas|Gollum|Bilbo Bolseiro|Luke Skywalker|Darth Vader|Princesa Leia|Han Solo|Yoda|Chewbacca|R2-D2|C-3PO|Homem-Aranha|Homem de Ferro|Capitão América|Thor|Hulk|Viúva Negra|Pantera Negra|Doutor Estranho|Feiticeira Escarlate|Wolverine|Deadpool|Batman|Superman|Mulher-Maravilha|Coringa|Arlequina|Mulher-Gato|Flash|Aquaman|Lanterna Verde|Shrek|Burro|Princesa Fiona|Gato de Botas|Mickey Mouse|Minnie Mouse|Pato Donald|Margarida|Pateta|Pluto|Tio Patinhas|Simba|Mufasa|Scar|Timão|Pumba|Aladdin|Jasmine|Gênio da Lâmpada|Ariel|Úrsula|Bela|Fera|Cinderela|Branca de Neve|Malévola|Rapunzel|Elsa|Anna|Olaf|Moana|Maui|Woody|Buzz Lightyear`,
      medium: `Nemo|Dory|Relâmpago McQueen|Mate|Remy|Dug|Bing Bong|Alegria|Tristeza|Gru|Vector|Megamente|Po|Mestre Shifu|Banguela|Soluço|Lilo|Stitch|Peter Pan|Sininho|Capitão Gancho|Alice|Chapeleiro Maluco|Rainha de Copas|Willy Wonka|Mary Poppins|Sherlock Holmes|Dr. Watson|Hercule Poirot|Indiana Jones|James Bond|Jack Sparrow|Forrest Gump|Rocky Balboa|Rambo|Ellen Ripley|Katniss Everdeen|Percy Jackson|Drácula|Monstro de Frankenstein|Zorro|Tarzan|Robin Hood|Dom Quixote|Sancho Pança|Romeu|Julieta|Pinóquio|Pequeno Príncipe|Dorothy|Espantalho|Homem de Lata|Leão Covarde|Mônica|Cebolinha|Cascão|Magali|Chico Bento|Franjinha|Bidu|Mingau|Sansão|Emília|Narizinho|Pedrinho|Visconde de Sabugosa|Dona Benta|Tia Nastácia|Cuca|Saci|Iara|Curupira|Boitatá|Mula sem cabeça|Boto-cor-de-rosa|Negrinho do Pastoreio|Caipora|Chaves|Chapolin|Seu Madruga|Dona Florinda|Quico|Chiquinha|Professor Girafales|Sonic|Mario|Luigi|Princesa Peach|Bowser|Link|Zelda|Pikachu|Ash Ketchum|Goku|Vegeta|Naruto Uzumaki|Monkey D. Luffy|Sailor Moon|Bob Esponja|Patrick Estrela|Lula Molusco`,
    },
  ],
  [
    'personalidades',
    'Celebridades e personalidades conhecidas',
    '⭐',
    'Pessoas conhecidas nas artes, no esporte e na história.',
    {
      easy: `Pelé|Marta|Neymar|Ronaldo Fenômeno|Ronaldinho Gaúcho|Romário|Kaká|Zico|Sócrates|Rivaldo|Cafu|Roberto Carlos|Cristiano Ronaldo|Lionel Messi|Diego Maradona|Ayrton Senna|Rubens Barrichello|Felipe Massa|Lewis Hamilton|Michael Schumacher|Rebeca Andrade|Daiane dos Santos|Rayssa Leal|Gabriel Medina|Ítalo Ferreira|Gustavo Kuerten|Serena Williams|Roger Federer|Rafael Nadal|Novak Djokovic|Usain Bolt|Michael Phelps|Simone Biles|Michael Jordan|LeBron James|Kobe Bryant|Oscar Schmidt|Hortência|Magic Paula|Giba|Bernardinho|Fofão|Arthur Zanetti|César Cielo|Thiago Braz|Isaquias Queiroz|Ana Marcela Cunha|Xuxa|Angélica|Eliana|Silvio Santos|Gugu Liberato|Luciano Huck|Faustão|Ana Maria Braga|Fátima Bernardes|William Bonner|Serginho Groisman|Jô Soares|Hebe Camargo|Celso Portiolli|Rodrigo Faro|Sabrina Sato|Tatá Werneck|Paulo Gustavo|Fábio Porchat|Leandro Hassum|Renato Aragão|Dedé Santana|Mussum`,
      medium: `Chico Anysio|Costinha|Dercy Gonçalves|Fernanda Montenegro|Fernanda Torres|Selton Mello|Wagner Moura|Lázaro Ramos|Taís Araújo|Camila Pitanga|Adriana Esteves|Débora Falabella|Regina Casé|Glória Pires|Sônia Braga|Marieta Severo|Tony Ramos|Lima Duarte|Antônio Fagundes|José de Abreu|Rodrigo Santoro|Bruna Marquezine|Marina Ruy Barbosa|Viola Davis|Meryl Streep|Julia Roberts|Sandra Bullock|Angelina Jolie|Scarlett Johansson|Emma Watson|Zendaya|Jennifer Lawrence|Leonardo DiCaprio|Brad Pitt|Tom Hanks|Tom Cruise|Will Smith|Denzel Washington|Morgan Freeman|Keanu Reeves|Johnny Depp|Robert Downey Jr.|Jackie Chan|Bruce Lee|Charlie Chaplin|Marilyn Monroe|Audrey Hepburn|Walt Disney|Steven Spielberg|George Lucas|Alfred Hitchcock|Quentin Tarantino|Tim Burton|Christopher Nolan|Hayao Miyazaki|Mauricio de Sousa|Ziraldo|Monteiro Lobato|Machado de Assis|Clarice Lispector|Jorge Amado|Carlos Drummond de Andrade|Cecília Meireles|Carolina Maria de Jesus|Conceição Evaristo|Paulo Freire|Ariano Suassuna|Cora Coralina|Mário de Andrade|Manuel Bandeira|Albert Einstein|Isaac Newton|Marie Curie|Charles Darwin|Galileu Galilei|Leonardo da Vinci|Frida Kahlo|Pablo Picasso|Vincent van Gogh|Tarsila do Amaral|Anita Malfatti|Candido Portinari|Santos Dumont|Ada Lovelace|Alan Turing|Stephen Hawking|Nikola Tesla|Thomas Edison|Nelson Mandela|Martin Luther King|Mahatma Gandhi|Malala Yousafzai|Anne Frank|Amelia Earhart|Yuri Gagarin|Neil Armstrong|Valentina Tereshkova|Jacques Cousteau|David Attenborough|Jane Goodall`,
    },
  ],
  [
    'esportes',
    'Esportes',
    '🏅',
    'Modalidades, equipamentos e momentos de competição.',
    {
      easy: `Futebol|Futsal|Futebol de areia|Vôlei|Vôlei de praia|Basquete|Handebol|Tênis|Tênis de mesa|Badminton|Golfe|Beisebol|Softbol|Futebol americano|Rúgbi|Hóquei|Críquete|Natação|Polo aquático|Saltos ornamentais|Surfe|Skate|Patinação|Ciclismo|Bicicross|Mountain bike|Corrida|Maratona|Atletismo|Salto em altura|Salto em distância|Salto com vara|Arremesso de peso|Lançamento de disco|Lançamento de dardo|Revezamento|Triatlo|Ginástica artística|Ginástica rítmica|Ginástica de trampolim|Judô|Caratê|Taekwondo|Boxe|Jiu-jítsu|Capoeira|Muay thai|MMA|Luta olímpica|Esgrima|Tiro com arco|Tiro esportivo|Hipismo|Remo|Canoagem|Vela|Escalada|Esqui|Snowboard|Curling|Biatlo|Patinação artística|Bobsled|Levantamento de peso|Fisiculturismo|Boliche|Sinuca|Xadrez|Damas|Tênis de praia`,
      medium: `Futevôlei|Futebol de botão|Peteca|Queimada|Pádel|Squash|Parkour|Slackline|Rafting|Windsurfe|Kitesurfe|Stand up paddle|Bodyboard|Mergulho|Paraquedismo|Asa-delta|Parapente|Automobilismo|Fórmula 1|Kart|Motocross|Motovelocidade|Rali|Enduro|Orientação|Pentatlo moderno|Decatlo|Heptatlo|Marcha atlética|Nado sincronizado|Maratona aquática|Futebol de cegos|Goalball|Bocha|Basquete em cadeira de rodas|Vôlei sentado|Halterofilismo paralímpico|Triatlo paralímpico|Bola|Chuteira|Trave|Rede|Raquete|Luva de boxe|Kimono|Tatame|Pódio|Medalha|Troféu|Apito|Cartão amarelo|Cartão vermelho|Pênalti|Escanteio|Impedimento|Gol|Cesta|Saque|Cortada|Bloqueio|Drible|Passe|Finta|Defesa|Rebote|Nocaute|Prorrogação|Disputa de pênaltis|Bateria de surfe|Pista de corrida|Quadra|Piscina olímpica|Velódromo|Campo de golfe|Estádio|Vestiário|Torcida|Capitão|Árbitro|Treinador|Goleiro|Atacante|Zagueiro|Levantador|Líbero|Pivô|Armador|Triatleta|Decatleta|Nadador`,
    },
  ],
  [
    'jogos',
    'Jogos e videogames',
    '🎮',
    'Dos jogos de mesa aos mundos digitais.',
    {
      easy: `Xadrez|Damas|Dominó|Ludo|Jogo da velha|Forca|Stop|Batalha naval|Banco Imobiliário|Jogo da Vida|Detetive|War|Imagem & Ação|Perfil|Cara a Cara|Uno|Baralho|Truco|Buraco|Paciência|Pôquer|Bingo|Memória|Quebra-cabeça|Pega-varetas|Jenga|Cubo mágico|Amarelinha|Esconde-esconde|Pega-pega|Cabra-cega|Bambolê|Pular corda|Bola de gude|Pião|Ioiô|Peteca|Queimada|Batata quente|Dança das cadeiras|Mímica|Telefone sem fio|Verdade ou desafio|Pedra, papel e tesoura|Minecraft|Roblox|Fortnite|Free Fire|Among Us|Fall Guys|Rocket League|League of Legends|Dota 2|Counter-Strike|Valorant|Overwatch|Apex Legends|PUBG|Call of Duty|Battlefield|Grand Theft Auto|Red Dead Redemption|The Sims|SimCity|Stardew Valley|Animal Crossing|Pokémon GO|Candy Crush|Angry Birds|Subway Surfers`,
      medium: `Temple Run|Fruit Ninja|Clash of Clans|Clash Royale|Brawl Stars|Plants vs. Zombies|Cut the Rope|Monument Valley|Genshin Impact|Honkai: Star Rail|Super Mario Bros.|Mario Kart|Mario Party|Super Smash Bros.|Donkey Kong Country|The Legend of Zelda|Kirby|Metroid|Splatoon|Pikmin|Wii Sports|Sonic the Hedgehog|Crash Bandicoot|Spyro the Dragon|Rayman|Pac-Man|Tetris|Space Invaders|Pong|Asteroids|Frogger|Bomberman|Mega Man|Castlevania|Street Fighter|Mortal Kombat|Tekken|The King of Fighters|Soulcalibur|Guilty Gear|Final Fantasy|Dragon Quest|Chrono Trigger|Kingdom Hearts|Persona|Fire Emblem|Undertale|Hollow Knight|Celeste|Cuphead|Ori and the Blind Forest|Hades|Dead Cells|Terraria|Don't Starve|Slay the Spire|Balatro|Vampire Survivors|Hearthstone|Magic: The Gathering|Yu-Gi-Oh!|Catan|Ticket to Ride|Dixit|Carcassonne|Azul|Dobble|Codenames|Dungeons & Dragons|Tormenta|World of Warcraft|RuneScape|Ragnarok Online|Tibia|Diablo|Path of Exile|Dark Souls|Elden Ring|Bloodborne|Sekiro|God of War|The Last of Us|Uncharted|Tomb Raider|Resident Evil|Silent Hill|Metal Gear Solid|Death Stranding|Assassin's Creed|Far Cry|Watch Dogs|Hitman|Batman: Arkham Asylum|Marvel's Spider-Man|Horizon Zero Dawn|Ghost of Tsushima|The Witcher|Skyrim|Fallout|Mass Effect|Dragon Age|Baldur's Gate|Cyberpunk 2077|Portal|Half-Life|Left 4 Dead|BioShock|Dishonored|Doom|Quake|Halo|Gears of War|Forza Horizon|Gran Turismo|Need for Speed|Burnout|Tony Hawk's Pro Skater|Just Dance|Guitar Hero|Rock Band`,
    },
  ],
  [
    'musica',
    'Música, artistas e instrumentos',
    '🎵',
    'Ritmos, artistas e instrumentos para dar o tom.',
    {
      easy: `Violão|Guitarra|Baixo|Bateria|Piano|Teclado|Flauta|Violino|Violoncelo|Contrabaixo|Saxofone|Trompete|Trombone|Clarinete|Sanfona|Órgão|Cavaquinho|Banjo|Ukulele|Bandolim|Harpa|Gaita|Pandeiro|Tamborim|Surdo|Repique|Cuíca|Agogô|Berimbau|Atabaque|Triângulo|Zabumba|Chocalho|Maracá|Reco-reco|Xilofone|Metalofone|Bongô|Congas|Cajón|Castanhola|Tímpano|Prato|Sino|Fagote|Oboé|Tuba|Trompa|Flauta doce|Flauta transversal|Samba|Pagode|Sertanejo|Forró|Funk|Rap|Hip-hop|Rock|Pop|Jazz|Blues|Reggae|Axé|Bossa nova|MPB|Música clássica|Ópera|Gospel|Música eletrônica|Heavy metal`,
      medium: `Punk|Disco|Soul|R&B|Country|K-pop|Reggaeton|Salsa|Merengue|Bolero|Tango|Frevo|Maracatu|Baião|Xote|Choro|Lambada|Tecnobrega|Piseiro|Brega|Cantiga de roda|Canção de ninar|Hino|Jingle|Paródia|Trilha sonora|Concerto|Orquestra|Coral|Banda|Dueto|Solo|Refrão|Melodia|Harmonia|Ritmo|Compasso|Partitura|Nota musical|Clave de sol|Metrônomo|Afinador|Microfone|Amplificador|Mesa de som|Fone de retorno|Palheta|Baqueta|Arco de violino|Pedal de efeito|Tom Jobim|Vinicius de Moraes|João Gilberto|Chico Buarque|Caetano Veloso|Gilberto Gil|Gal Costa|Maria Bethânia|Elis Regina|Elza Soares|Milton Nascimento|Djavan|Tim Maia|Jorge Ben Jor|Cartola|Adoniran Barbosa|Noel Rosa|Pixinguinha|Luiz Gonzaga|Dominguinhos|Alceu Valença|Zeca Pagodinho|Paulinho da Viola|Beth Carvalho|Alcione|Clara Nunes|Martinho da Vila|Seu Jorge|Marisa Monte|Carlinhos Brown|Arnaldo Antunes|Rita Lee|Cazuza|Renato Russo|Raul Seixas|Chorão|Sandy|Junior Lima|Ivete Sangalo|Claudia Leitte|Anitta|Ludmilla|Iza|Pabllo Vittar|Gloria Groove|Lulu Santos|Jota Quest|Skank|Titãs|Paralamas do Sucesso|Capital Inicial|Charlie Brown Jr.|Legião Urbana|Os Mutantes|Racionais MC's|Emicida|Criolo|Liniker|Luedji Luna|Marília Mendonça|Maiara & Maraisa|Henrique & Juliano|Jorge & Mateus|Chitãozinho & Xororó|Zezé Di Camargo & Luciano|Almir Sater|Sérgio Reis|Roberto Carlos|Erasmo Carlos|Wesley Safadão|Xand Avião|The Beatles|Queen|ABBA|Bee Gees|The Rolling Stones|Pink Floyd|Nirvana|Metallica|AC/DC|U2|Coldplay|Radiohead|Oasis|Linkin Park|Beyoncé|Taylor Swift|Madonna|Michael Jackson|Prince|Whitney Houston|Mariah Carey|Céline Dion|Adele|Lady Gaga|Rihanna|Bruno Mars|Ed Sheeran|Billie Eilish|Dua Lipa|Shakira|Bad Bunny|Bob Marley|Elvis Presley|David Bowie|Elton John|Stevie Wonder|Aretha Franklin|Louis Armstrong|Ella Fitzgerald|Frank Sinatra|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach|Heitor Villa-Lobos|Chiquinha Gonzaga`,
    },
  ],
  [
    'tecnologia',
    'Tecnologia e internet',
    '💻',
    'Aparelhos, aplicativos e ideias do mundo digital.',
    {
      easy: `Computador|Notebook|Tablet|Celular|Smartphone|Smartwatch|Televisão|Monitor|Teclado|Mouse|Touchpad|Webcam|Microfone|Caixa de som|Fone de ouvido|Impressora|Scanner|Projetor|Roteador|Modem|Antena|Cabo USB|Carregador|Bateria|Pilha|Tomada|Adaptador|Pen drive|Cartão de memória|HD externo|Controle remoto|Controle de videogame|Console|Câmera digital|Drone|Robô|Calculadora|GPS|Internet|Wi-Fi|Bluetooth|Rede social|Site|Blog|E-mail|Mensagem|Chamada de vídeo|Podcast|Streaming|Vídeo|Foto|Meme|Emoji|Figurinha|GIF|Hashtag|Link|Perfil|Avatar|Feed|Story|Reels|Curtida|Comentário|Compartilhamento|Seguidor|Influenciador|Canal|Playlist|Notificação`,
      medium: `Aplicativo|Navegador|Buscador|Sistema operacional|Área de trabalho|Pasta|Arquivo|Atalho|Lixeira|Download|Upload|Instalação|Atualização|Senha|Login|Logout|Cadastro|Autenticação|Código QR|Código de barras|Nuvem|Backup|Sincronização|Modo avião|Modo escuro|Tela sensível ao toque|Biometria|Reconhecimento facial|Leitor de impressão digital|Assistente virtual|Inteligência artificial|Chatbot|Realidade virtual|Realidade aumentada|Impressão 3D|Casa inteligente|Automação|Algoritmo|Programação|Código-fonte|Banco de dados|Planilha|Editor de texto|Apresentação|PDF|Captura de tela|Compartilhamento de tela|Histórico de navegação|Favoritos|Aba do navegador|Janela anônima|Cookie|Cache|Firewall|Antivírus|Vírus de computador|Spam|Phishing|Criptografia|VPN|Servidor|Processador|Memória RAM|Placa de vídeo|Placa-mãe|SSD|HDMI|Ethernet|Fibra óptica|5G|Código aberto|Licença de software|Repositório|Git|HTML|CSS|JavaScript|Python|Bug|Depuração|Pix|Carteira digital|Pagamento por aproximação|Comércio eletrônico|Carrinho de compras|Marketplace|WhatsApp|Instagram|TikTok|YouTube|Facebook|LinkedIn|Discord|Reddit|Telegram|Spotify|Netflix|Twitch|Google Maps|Wikipédia`,
    },
  ],
  [
    'natureza',
    'Natureza e meio ambiente',
    '🌿',
    'Paisagens, plantas, clima e cuidado com o planeta.',
    {
      easy: `Árvore|Flor|Folha|Raiz|Tronco|Galho|Fruto|Semente|Broto|Grama|Mato|Arbusto|Cacto|Samambaia|Musgo|Alga|Cogumelo|Palmeira|Coqueiro|Pinheiro|Eucalipto|Bambu|Ipê|Mangueira|Jabuticabeira|Laranjeira|Limoeiro|Bananeira|Roseira|Girassol|Margarida|Orquídea|Lírio|Tulipa|Violeta|Hortênsia|Lavanda|Jasmim|Hibisco|Vitória-régia|Floresta|Bosque|Selva|Mata|Cerrado|Caatinga|Pantanal|Pampa|Amazônia|Mata Atlântica|Praia|Areia|Duna|Mar|Oceano|Onda|Maré|Rio|Riacho|Córrego|Lago|Lagoa|Cachoeira|Nascente|Montanha|Serra|Vale|Colina|Planalto|Planície|Caverna|Gruta|Rocha|Pedra|Cristal|Solo|Terra|Barro|Argila|Cascalho`,
      medium: `Manguezal|Restinga|Savana|Tundra|Taiga|Deserto|Oásis|Vulcão|Lava|Magma|Cratera|Geleira|Iceberg|Neve|Geada|Granizo|Chuva|Garoa|Tempestade|Temporal|Trovão|Relâmpago|Raio|Vento|Brisa|Ventania|Furacão|Tornado|Ciclone|Neblina|Névoa|Orvalho|Nuvem|Arco-íris|Sol|Lua|Estrela|Cometa|Meteoro|Aurora boreal|Eclipse|Nascer do sol|Pôr do sol|Primavera|Verão|Outono|Inverno|Estiagem|Seca|Enchente|Inundação|Terremoto|Tsunami|Erosão|Assoreamento|Deslizamento|Efeito estufa|Aquecimento global|Mudança climática|Camada de ozônio|Poluição|Desmatamento|Queimada|Reflorestamento|Reciclagem|Coleta seletiva|Compostagem|Adubo|Horta|Jardim|Pomar|Agricultura orgânica|Agrofloresta|Energia solar|Energia eólica|Energia hidrelétrica|Biomassa|Biogás|Sustentabilidade|Biodiversidade|Ecossistema|Habitat|Cadeia alimentar|Polinização|Fotossíntese|Germinação|Decomposição|Migração|Hibernação|Camuflagem|Extinção|Espécie ameaçada|Reserva ambiental|Parque nacional|Unidade de conservação|Área de preservação|Corredor ecológico|Recife de coral|Atol|Arquipélago|Península|Cabo|Baía|Enseada|Estuário|Delta|Bacia hidrográfica|Lençol freático|Aquífero|Fóssil`,
    },
  ],
  [
    'transportes',
    'Transportes e veículos',
    '🚆',
    'Caminhos, viagens e meios de transporte.',
    {
      easy: `Carro|Motocicleta|Bicicleta|Ônibus|Caminhão|Van|Micro-ônibus|Táxi|Ambulância|Viatura|Carro de bombeiros|Trator|Escavadeira|Retroescavadeira|Empilhadeira|Guindaste|Rolo compressor|Caminhão de lixo|Caminhão-pipa|Caminhão-tanque|Caminhão-baú|Betoneira|Carreta|Reboque|Guincho|Caminhonete|Picape|Conversível|Limusine|Furgão|Jipe|Bugue|Kart|Quadriciclo|Triciclo|Patinete|Skate|Patins|Charrete|Carroça|Carrinho de mão|Carrinho de bebê|Cadeira de rodas|Trem|Metrô|Bonde|Monotrilho|Locomotiva|Vagão|Teleférico|Funicular|Avião|Helicóptero|Jato|Planador|Balão|Dirigível|Ultraleve|Drone|Foguete|Ônibus espacial|Navio|Barco|Lancha|Veleiro|Iate|Balsa|Caravela|Canoa|Caiaque`,
      medium: `Jangada|Gôndola|Pedalinho|Jet ski|Submarino|Transatlântico|Navio cargueiro|Petroleiro|Porta-aviões|Rebocador|Catamarã|Hidroavião|Avião cargueiro|Avião agrícola|Avião comercial|Carro elétrico|Carro híbrido|Bicicleta elétrica|Ônibus articulado|Ônibus de dois andares|Trem-bala|Trem de carga|Trem turístico|Maria-fumaça|Trenó|Riquixá|Tuk-tuk|Segway|Motorhome|Trailer|Volante|Pedal|Freio|Embreagem|Acelerador|Câmbio|Marcha|Motor|Radiador|Escapamento|Buzina|Farol|Lanterna traseira|Pisca-alerta|Retrovisor|Para-brisa|Limpador de para-brisa|Capô|Porta-malas|Para-choque|Pneu|Roda|Estepe|Calota|Cinto de segurança|Airbag|Cadeirinha|Capacete|Guidão|Selim|Corrente|Garupa|Bagageiro|Tanque de combustível|Posto de gasolina|Pedágio|Estacionamento|Garagem|Rodovia|Estrada|Avenida|Rua|Ciclovia|Calçada|Faixa de pedestres|Semáforo|Rotatória|Viaduto|Ponte|Túnel|Acostamento|Canteiro central|Ponto de ônibus|Terminal|Rodoviária|Estação ferroviária|Aeroporto|Pista de pouso|Torre de controle|Hangar|Porto|Cais|Atracadouro|Canal|Eclusa|Âncora|Leme|Vela náutica|Hélice|Turbina`,
    },
  ],
  [
    'escola',
    'Escola, faculdade e conhecimentos gerais',
    '📚',
    'Aprendizado, vida escolar e curiosidades.',
    {
      easy: `Escola|Faculdade|Universidade|Creche|Pré-escola|Ensino fundamental|Ensino médio|Ensino técnico|Graduação|Pós-graduação|Mestrado|Doutorado|Sala de aula|Biblioteca|Laboratório|Quadra|Pátio|Refeitório|Cantina|Secretaria|Diretoria|Auditório|Sala dos professores|Carteira escolar|Lousa|Giz|Apagador|Quadro branco|Projetor|Computador|Caderno|Fichário|Agenda|Estojo|Lápis|Caneta|Borracha|Apontador|Régua|Compasso|Transferidor|Esquadro|Calculadora|Livro didático|Dicionário|Atlas|Globo terrestre|Mapa|Mochila|Lancheira|Uniforme|Crachá|Boletim|Prova|Teste|Trabalho em grupo|Seminário|Apresentação|Redação|Ditado|Lição de casa|Recreio|Excursão|Feira de ciências|Festa junina|Formatura|Diploma|Certificado|Vestibular|Enem`,
      medium: `Matrícula|Chamada|Lista de presença|Calendário escolar|Horário de aula|Grade curricular|Plano de ensino|Monitoria|Tutoria|Estágio|Bolsa de estudos|Intercâmbio|Iniciação científica|Pesquisa|Tese|Dissertação|Monografia|Artigo científico|Referência bibliográfica|Plágio|Resumo|Resenha|Fichamento|Anotação|Mapa mental|Português|Matemática|História|Geografia|Ciências|Biologia|Física|Química|Filosofia|Sociologia|Artes|Educação física|Inglês|Espanhol|Literatura|Gramática|Alfabeto|Vogal|Consoante|Sílaba|Substantivo|Verbo|Adjetivo|Pronome|Sinônimo|Antônimo|Pontuação|Acentuação|Metáfora|Poesia|Conto|Crônica|Romance|Fábula|Lenda|Adição|Subtração|Multiplicação|Divisão|Fração|Porcentagem|Equação|Raiz quadrada|Potência|Número primo|Número decimal|Geometria|Triângulo|Quadrado|Retângulo|Círculo|Losango|Trapézio|Cubo|Esfera|Pirâmide|Cone|Cilindro|Perímetro|Área|Volume|Ângulo|Estatística|Probabilidade|Gráfico|Tabela|Média|Mediana|Moda|Sistema solar|Planeta|Continente|Oceano|Capital|Bandeira|Fuso horário|Latitude|Longitude|Rosa dos ventos|Bússola|Relevo|Clima|População|Democracia|Cidadania|Constituição|República|Monarquia|Independência|Revolução Industrial|Renascimento|Idade Média|Pré-história|Arqueologia|Museu`,
    },
  ],
  [
    'corpo-saude',
    'Corpo humano, saúde e bem-estar',
    '🫀',
    'Partes do corpo, cuidados e hábitos do dia a dia.',
    {
      easy: `Cabeça|Cabelo|Testa|Rosto|Olho|Sobrancelha|Cílio|Pálpebra|Orelha|Nariz|Bochecha|Boca|Lábio|Dente|Gengiva|Língua|Queixo|Mandíbula|Pescoço|Garganta|Nuca|Ombro|Braço|Cotovelo|Antebraço|Pulso|Mão|Dedo|Polegar|Unha|Peito|Seio|Costela|Costas|Coluna|Barriga|Umbigo|Cintura|Quadril|Nádega|Perna|Coxa|Joelho|Panturrilha|Canela|Tornozelo|Calcanhar|Pé|Sola do pé|Dedão do pé|Pele|Osso|Músculo|Tendão|Articulação|Coração|Pulmão|Cérebro|Estômago|Intestino|Fígado|Rim|Bexiga|Sangue|Veia|Artéria|Nervo|Respiração|Batimento cardíaco|Pulsação`,
      medium: `Esqueleto|Crânio|Clavícula|Escápula|Esterno|Pelve|Fêmur|Tíbia|Patela|Úmero|Cartilagem|Ligamento|Medula|Diafragma|Traqueia|Laringe|Faringe|Esôfago|Pâncreas|Baço|Apêndice|Vesícula biliar|Tireoide|Retina|Íris|Pupila|Córnea|Tímpano|Cóclea|Cordas vocais|Saliva|Lágrima|Suor|Digestão|Circulação|Metabolismo|Imunidade|Hormônio|Reflexo|Equilíbrio|Visão|Audição|Olfato|Paladar|Tato|Sono|Sonho|Bocejo|Espreguiçamento|Soluço|Espirro|Tosse|Febre|Dor de cabeça|Dor de garganta|Dor muscular|Câimbra|Contusão|Hematoma|Arranhão|Cicatriz|Fratura|Torção|Queimadura|Alergia|Resfriado|Gripe|Rinite|Sinusite|Asma|Otite|Conjuntivite|Cárie|Gengivite|Miopia|Astigmatismo|Hipermetropia|Acne|Vacina|Consulta|Exame de sangue|Raio X|Ultrassom|Tomografia|Ressonância magnética|Eletrocardiograma|Estetoscópio|Termômetro|Seringa|Curativo|Gaze|Esparadrapo|Muleta|Tipoia|Gesso|Órtese|Prótese|Óculos|Aparelho auditivo|Aparelho ortodôntico|Escova de dentes|Fio dental|Protetor solar|Repelente|Sabonete|Álcool em gel|Máscara|Higiene|Banho|Hidratação|Alimentação equilibrada|Descanso|Alongamento|Caminhada|Corrida|Natação|Ioga|Pilates|Meditação|Massagem|Fisioterapia|Terapia|Saúde mental|Autoestima|Autocuidado|Lazer|Convivência|Acolhimento|Primeiros socorros|Doação de sangue`,
    },
  ],
  [
    'moda',
    'Moda, roupas e acessórios',
    '👕',
    'Peças, estilos e detalhes do guarda-roupa.',
    {
      easy: `Camiseta|Camisa|Blusa|Regata|Top|Cropped|Polo|Moletom|Suéter|Cardigã|Casaco|Jaqueta|Blazer|Paletó|Colete|Sobretudo|Trench coat|Capa de chuva|Poncho|Quimono|Vestido|Saia|Minissaia|Calça|Jeans|Legging|Bermuda|Shorts|Macacão|Jardineira|Conjunto|Terno|Smoking|Pijama|Camisola|Robe|Roupão|Cueca|Calcinha|Sutiã|Cinta|Meia|Meia-calça|Collant|Maiô|Biquíni|Sunga|Saída de praia|Canga|Uniforme|Avental|Jaleco|Roupa de banho|Roupa de ginástica|Vestido de noiva|Gravata|Gravata-borboleta|Lenço|Cachecol|Echarpe|Xale|Gorro|Touca|Boné|Chapéu|Boina|Viseira|Capuz|Luva|Cinto`,
      medium: `Suspensório|Faixa de cabelo|Tiara|Presilha|Grampo de cabelo|Elástico de cabelo|Laço|Bandana|Turbante|Peruca|Brinco|Colar|Pulseira|Bracelete|Anel|Aliança|Pingente|Broche|Tornozeleira|Abotoadura|Relógio|Óculos de sol|Bolsa|Mochila|Pochete|Carteira|Clutch|Necessaire|Sacola|Mala|Porta-cartões|Tênis|Sapato|Sandália|Chinelo|Sapatilha|Rasteirinha|Bota|Coturno|Galocha|Mocassim|Alpargata|Scarpin|Tamanco|Pantufa|Chuteira|Salto alto|Salto agulha|Salto plataforma|Salto anabela|Cadarço|Palmilha|Sola|Fivela|Zíper|Botão|Colchete|Velcro|Ilhós|Bolso|Gola|Punho|Manga|Barra|Decote|Fenda|Babado|Pregas|Plissado|Renda|Bordado|Lantejoula|Paetê|Franja|Estampa|Listra|Xadrez|Poá|Floral|Animal print|Tie-dye|Degradê|Algodão|Linho|Seda|Lã|Couro|Camurça|Veludo|Cetim|Tule|Organza|Chiffon|Malha|Tricô|Crochê|Jeans rasgado|Calça cargo|Calça pantalona|Calça pantacourt|Calça flare|Saia lápis|Saia evasê|Vestido tubinho|Vestido longo|Manga bufante|Gola alta|Gola canoa|Gola V|Ombreira|Modelagem|Costura|Alta-costura|Prêt-à-porter|Moda sustentável|Brechó|Desfile|Passarela|Manequim|Provador|Etiqueta`,
    },
  ],
  [
    'casa',
    'Casa, móveis e decoração',
    '🛋️',
    'Ambientes, móveis e detalhes de casa.',
    {
      easy: `Casa|Apartamento|Sobrado|Quitinete|Loft|Edícula|Varanda|Sacada|Terraço|Quintal|Jardim|Garagem|Portão|Muro|Cerca|Entrada|Corredor|Escada|Hall|Sala de estar|Sala de jantar|Quarto|Suíte|Banheiro|Lavabo|Cozinha|Copa|Despensa|Lavanderia|Área de serviço|Escritório|Biblioteca|Closet|Sótão|Porão|Telhado|Chaminé|Lareira|Parede|Teto|Piso|Rodapé|Janela|Porta|Batente|Maçaneta|Fechadura|Dobradiça|Vidro|Persiana|Cortina|Varão|Tapete|Capacho|Sofá|Poltrona|Pufe|Cadeira|Banco|Banqueta|Mesa|Mesa de centro|Mesa lateral|Mesa de jantar|Escrivaninha|Estante|Prateleira|Rack|Aparador|Cristaleira`,
      medium: `Buffet|Armário|Guarda-roupa|Cômoda|Penteadeira|Sapateira|Cabideiro|Gaveteiro|Baú|Cama|Beliche|Treliche|Cama box|Sofá-cama|Berço|Cama de solteiro|Cama de casal|Cabeceira|Estrado|Colchão|Travesseiro|Almofada|Lençol|Fronha|Edredom|Cobertor|Manta|Colcha|Mosquiteiro|Rede de descanso|Criado-mudo|Abajur|Luminária|Lustre|Arandela|Plafon|Pendente|Fita de LED|Spot de luz|Interruptor|Tomada|Espelho|Quadro|Pôster|Fotografia|Porta-retrato|Vaso|Cachepô|Floreira|Escultura|Enfeite|Miniatura|Estatueta|Relógio de parede|Calendário|Painel|Papel de parede|Adesivo decorativo|Azulejo|Pastilha|Porcelanato|Cerâmica|Carpete|Taco de madeira|Piso laminado|Cimento queimado|Mármore|Granito|Bancada|Ilha de cozinha|Cuba|Pia|Torneira|Filtro de água|Fogão|Cooktop|Forno|Micro-ondas|Geladeira|Freezer|Coifa|Depurador|Lava-louças|Liquidificador|Batedeira|Cafeteira|Torradeira|Sanduicheira|Air fryer|Panela elétrica|Chaleira elétrica|Processador de alimentos|Espremedor de frutas|Centrífuga|Máquina de lavar roupa|Secadora|Tanque|Varal|Ferro de passar|Tábua de passar|Aspirador de pó|Robô aspirador|Ventilador|Ar-condicionado|Aquecedor|Umidificador|Desumidificador|Chuveiro|Banheira|Box|Vaso sanitário|Bidê|Ducha higiênica|Toalheiro|Saboneteira|Porta-escovas|Cesto de roupa|Lixeira|Escorredor de pratos|Fruteira|Porta-temperos`,
    },
  ],
  [
    'festas',
    'Festas, feriados e celebrações',
    '🎉',
    'Datas especiais, rituais e itens de festa.',
    {
      easy: `Aniversário|Festa de quinze anos|Casamento|Noivado|Bodas de prata|Bodas de ouro|Chá de panela|Chá de bebê|Chá revelação|Batizado|Formatura|Baile de formatura|Colação de grau|Confraternização|Amigo secreto|Festa surpresa|Festa à fantasia|Baile de máscaras|Festa do pijama|Festa na piscina|Churrasco|Piquenique|Luau|Karaokê|Sarau|Baile|Matinê|Quermesse|Arraial|Festa junina|Festa julina|Carnaval|Natal|Ano-Novo|Páscoa|Sexta-feira Santa|Domingo de Ramos|Quarta-feira de Cinzas|Corpus Christi|Dia das Mães|Dia dos Pais|Dia das Crianças|Dia dos Namorados|Dia da Mulher|Dia do Trabalhador|Dia do Professor|Dia do Estudante|Dia da Consciência Negra|Dia da Independência|Proclamação da República|Tiradentes|Finados|Dia de Nossa Senhora Aparecida|Dia de São João|Dia de São Pedro|Dia de Santo Antônio|Dia de São Jorge|Dia de Reis|Halloween|Dia de Ação de Graças|Dia dos Mortos|Ano-Novo Chinês|Oktoberfest|Festival|Show|Concerto|Desfile|Bloco de carnaval|Escola de samba|Trio elétrico`,
      medium: `Sambódromo|Abadá|Fantasia|Máscara|Confete|Serpentina|Purpurina|Glitter|Bandeirinha|Balão|Bexiga|Faixa de parabéns|Vela de aniversário|Bolo|Docinho|Brigadeiro|Beijinho|Cajuzinho|Cupcake|Bem-casado|Mesa de doces|Salgadinho|Buffet|Convite|Lista de convidados|Lista de presentes|Lembrancinha|Presente|Papel de presente|Laço|Cartão|Envelope|Buquê|Aliança|Véu|Grinalda|Vestido de noiva|Marcha nupcial|Padrinho|Madrinha|Daminha|Pajem|Cerimonialista|Fotógrafo|DJ|Banda|Pista de dança|Globo espelhado|Luz de festa|Pulseira neon|Chapéu de festa|Língua de sogra|Estalinho|Fogos de artifício|Fogueira|Quadrilha|Correio elegante|Pescaria|Bingo|Barraca do beijo|Pau de sebo|Corrida do saco|Corrida do ovo|Touro mecânico|Tobogã inflável|Cama elástica|Piscina de bolinhas|Mágico|Palhaço|Pintura facial|Escultura de balão|Algodão-doce|Pipoca|Maçã do amor|Canjica|Pamonha|Quentão|Vinho quente|Ceia|Panetone|Rabanada|Peru de Natal|Árvore de Natal|Pisca-pisca|Guirlanda|Presépio|Papai Noel|Meia de Natal|Trenó|Rena|Sino|Ovo de Páscoa|Coelho da Páscoa|Colomba pascal|Caça aos ovos|Procissão|Romaria|Missa|Culto|Ação de graças|Homenagem|Discurso|Brinde|Contagem regressiva|Abraço coletivo|Chuva de arroz|Cortejo|Coroação|Premiação|Tapete vermelho|Festival de cinema|Festival de música|Festa da colheita|Festa do Divino|Círio de Nazaré|Lavagem do Bonfim|Bumba meu boi|Festival de Parintins|Congada|Folia de Reis`,
    },
  ],
  [
    'acoes',
    'Ações e verbos',
    '🏃',
    'Ações para imaginar, descrever e representar.',
    {
      easy: `Andar|Correr|Pular|Pescar|Dançar|Cantar|Falar|Sussurrar|Gritar|Rir|Sorrir|Chorar|Dormir|Acordar|Sonhar|Bocejar|Espreguiçar|Respirar|Espirrar|Tossir|Soluçar|Comer|Beber|Mastigar|Engolir|Cozinhar|Assar|Fritar|Ferver|Mexer|Misturar|Cortar|Picar|Descascar|Temperar|Servir|Lavar|Enxaguar|Secar|Limpar|Varrer|Esfregar|Aspirar|Passar roupa|Dobrar|Guardar|Organizar|Arrumar|Bagunçar|Vestir|Calçar|Pentear|Escovar|Barbear|Maquiar|Tomar banho|Nadar|Mergulhar|Boiar|Pedalar|Patinar|Dirigir|Estacionar|Frear|Acelerar|Voar|Remar|Navegar|Viajar|Passear|Subir|Descer|Entrar|Sair|Sentar|Levantar|Deitar|Agachar|Ajoelhar|Rastejar`,
      medium: `Engatinhar|Escalar|Equilibrar|Girar|Rodar|Balançar|Escorregar|Tropeçar|Cair|Rolar|Empurrar|Puxar|Carregar|Levantar peso|Arrastar|Transportar|Buscar|Levar|Trazer|Pegar|Soltar|Segurar|Apertar|Afrouxar|Abrir|Fechar|Trancar|Destrancar|Amarrar|Desamarrar|Prender|Desprender|Montar|Desmontar|Construir|Demolir|Consertar|Quebrar|Colar|Pregar|Parafusar|Lixar|Pintar|Desenhar|Colorir|Rabiscar|Apagar|Escrever|Ler|Estudar|Ensinar|Aprender|Pesquisar|Perguntar|Responder|Explicar|Contar|Calcular|Somar|Subtrair|Multiplicar|Dividir|Medir|Pesar|Comparar|Classificar|Escolher|Decidir|Planejar|Imaginar|Inventar|Criar|Observar|Olhar|Enxergar|Ouvir|Escutar|Cheirar|Provar|Tocar|Sentir|Lembrar|Esquecer|Reconhecer|Descobrir|Procurar|Encontrar|Esconder|Revelar|Adivinhar|Investigar|Fotografar|Filmar|Gravar|Editar|Publicar|Compartilhar|Enviar|Receber|Telefonar|Digitar|Clicar|Baixar|Instalar|Carregar a bateria|Comprar|Vender|Pagar|Cobrar|Economizar|Poupar|Gastar|Trocar|Emprestar|Devolver|Doar|Presentear|Agradecer|Pedir|Oferecer|Aceitar|Recusar|Convidar|Visitar|Cumprimentar|Abraçar|Beijar|Acariciar|Acolher|Cuidar|Ajudar|Cooperar|Dividir tarefas|Brincar|Jogar|Competir|Torcer|Vencer|Perder|Empatar|Treinar|Alongar|Relaxar|Meditar|Descansar|Esperar|Costurar|Apressar|Atrasar|Começar|Terminar|Continuar|Parar|Recomeçar|Repetir|Mudar|Transformar|Crescer|Diminuir|Aumentar|Encolher|Florescer|Plantar|Regar|Colher|Podar|Cavar|Semear|Adubar|Reciclar|Reutilizar|Separar|Descartar|Proteger|Preservar|Apagar o fogo|Acender|Iluminar|Aquecer|Esfriar|Congelar|Derreter|Tricotar|Ventilar|Assoprar|Assobiar|Estalar os dedos|Bater palmas|Fazer careta|Piscar|Apontar|Acenar|Imitar|Representar|Atuar|Declamar|Narrar|Argumentar|Debater|Negociar|Convencer|Concordar|Discordar|Prometer|Cumprir|Perdoar|Comemorar|Bordar|Brindar`,
    },
  ],
];

await mkdir(new URL('../src/data/words/', import.meta.url), { recursive: true });
const catalog = [];
for (const [id, name, emoji, description, levels] of definitions) {
  const words = Object.entries(levels).flatMap(([difficulty, text]) =>
    text.split('|').map((word) => ({ text: word.trim(), difficulty })),
  );
  await writeFile(
    new URL(`../src/data/words/${id}.json`, import.meta.url),
    `${JSON.stringify(words, null, 2)}\n`,
  );
  catalog.push({ id, name, emoji, description, file: `${id}.json` });
}
await writeFile(
  new URL('../src/data/catalog.json', import.meta.url),
  `${JSON.stringify(catalog, null, 2)}\n`,
);
console.log(
  `Gravados ${catalog.length} temas em ${fileURLToPath(new URL('../src/data/words/', import.meta.url))}.`,
);
