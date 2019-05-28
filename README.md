# Práctica final Entornos Multijudaor #
____
## Trabajo realizado por: ##
- **David Fontela Moñino**
- **Javier Hernández Osuna**
- **Carlos Ruiz Romero**
____
## Índice ##
1. [Conexión websocket](#id1)
2. [Funcionamiento Aplicación](#id2)
3. [Funcionamiento inGame](#id3)

___
### 1. Conexión websocket <a name="id1"></a> ###

Para conectarnos en nuestro juego de SpaceWars de forma remota hemos decidido usar la herramienta para hacer conexiones mediante túnel llamada **Hamachi**, la cual simula una red local entre los ordenadores elegidos para así poder conectarnos sin tener que estar en una LAN.
También hemos creado un archivo llamado ***connectionData.json*** el cual nos permite configurar la IP en la que queremos levantar nuestro juego. Esto lo decidimos ya que para el control de versiones en Git era más útil tenerlo en un archivo a parte para que no contara como modificación de ***Index.js***.
Antes de iniciar el juego debemos mirar este archivo y poner la IP correcta, si estamos usando Hamachi, colocaremos nuestra IPv4 local con el puerto 8080, por otro lado si simplemente lo ejecutamos en nuestro ordenador usaremos la IP ***127.0.0.1:8080*** para levantar el servidor.
En este archivo hemos aprovechado para añadir también una parte de la configuración referente al juego, si cambiamos el valor de ***debug*** podemos activar el modo debug de la aplicación que nos irá mandando mensajes por la consola de nuestro navegador. También hay otro booleano en referencia a si las salas empiezan o no automáticamente cuando estas se llenan, este se denomina ***autostartgame***, de forma genérica está asignado a false, ya que para mostrar más funcionalidades del juego es útil que este no comience las partidas cuando se llenen las salas.

### 2. Funcionamiento de la aplicación <a name="id2"></a> ###
Al entrar en el juego esperaremos a recibir la respuesta del servidor, al conseguirla estaremos conectados y podremos elegir un nombre de usuario.
Tras elegir un nombre de usuario no único y tampoco nulo, nos escontraremos con un chat general con los jugadores que se encuentran en el menu y una ventana con los jugadores que se encuentran jugando alguna partida. Si pulsamos el botón de Start pasaremos a la siguiente sala o el pequeño botón de Hamburguer menu para acceder al ranking persistente y global de los juegos.


La siguiente sala es el **Lobby**, aqui podremos pulsar el botón de matchmaking para encontrar una partida, si esque existe, una partida. Sino creará una partida genérica con el modo ***BattleRoyale*** para jugar directamente en ella. También podremos navegar por las diferentes salas decidiendo en cual entrar o crear una nosotros mismos. Dispondremos de información como el nombre y la capacidad de jugadores que entran en la sala, a su vez, si al intentar unirnos la sala esta llena, esperaremos durante 5 segundos de máximo para entrar en esa sala si es que llega a haber un hueco en ella, pudiendo cancelar esa espera en cualquier momento. También podremos volver al menú anterior y observar una tabla de puntuaciones más altas de los jugadores.


Si decidimos crear una **Sala**, una nueva ventana aparecerá. Aquí podemos elegir el nombre de la sala y el modo de juego de la misma para después crearla. La sala que creemos no podrá compartir nombre con otra sala del servidor, aunque tengan diferente modo de juego. Dentro de la sala tendremos la información de jugadores conectados, del nombre de la sala y del modo de juego que tiene la sala, también habrá un chat en el que podrán hablar los jugadores de la misma, avisando a los jugadores cuando un jugador nuevo entra o abandona la sala. El jugador que la creó es el que decide cuando empieza la partida.
Al terminar podremos volver al **Lobby** para crear una nueva partida o realizar las acciones que consideremos.

### 3. Funcionamiento inGame <a name="id3"></a> ###
En nuestro videojuego hay 3 modos de juego diferentes, **Classic**, **BattleRoyale** y **BattleRoyale+**.

La mecánica básica de se mantienen en los tres, las muerte son permanentes, es decir si mueres en una partida no puedes hacer respawn, deberás abandonarla en algún momento para poder jugar otra. Tanto las balas como el movimiento de nuestra nave es limitado. No moveremos con las típicas teclas *WASD*, y nuestro movimiento será limitado por nuestro **Thrust**, este va bajando poco a poco según nos vayamos moviendo, pero también sube poco a poco en cuanto nos quedemos parados. En referencia a las balas, las podremos disparar con la tecla *Espacio*, tendremos munición límita indicada en la parte inferior izquierda, al lado del **Thrust** con un número y la palabra **Ammo**, la munición se podrá recargar mediante power ups que spawnean de forma aleatoria en la partida. Estos power ups nos darán 10 balas más a nuestra nave y además 1 punto en nuestra puntuación que se encuentra en la parte superior derecha con la palabra **SCORE**, también nos dará puntuación impactar una bala en un enemigo, 10 conncretamente.

Si hablamos de la vida, podemos ver tanto la de los enemigos como la nuestra propia, incluyendo también el nombre del jugador al que le corresponde la vida y la nave asignada. En el caso de nuestra vida también la veremos en la parte superior izquierda y podremos aguantar hasta 10 balas enemigas. Si morimos o ganamos aparecerá un botón para abandonar la sala y volver al **Lobby**, pero se diferenciará ya que al perder obtenemos un letro de Git Gud, mientras que al ganar un letrero de Victoria Magistral.