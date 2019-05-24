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

___
### 1. Conexión websocket <a name="id1"></a> ###

Para conectarnos en nuestro juego de SpaceWars de forma remota hemos decidido usar la herramienta para hacer conexiones mediante túnel llamada **Hamachi**, la cual simula una red local entre los ordenadores elegidos para así poder conectarnos sin tener que estar en una LAN.
También hemos creado un archivo llamado ***connectionData.json*** el cual nos permite configurar la IP en la que queremos levantar nuestro juego. Esto lo decidimos ya que para el control de versiones en Git era más útil tenerlo en un archivo a parte para que no contara como modificación de ***Index.js***.
Antes de iniciar el juego debemos mirar este archivo y poner la IP correcta, si estamos usando Hamachi, colocaremos nuestra IPv4 local con el puerto 8080, por otro lado si simplemente lo ejecutamos en nuestro ordenador usaremos la IP ***127.0.0.1:8080*** para levantar el servidor.

### 2. Funcionamiento de la aplicación <a name="id2"></a> ###
Al entrar en el juego esperaremos a recibir la respuesta del servidor, al conseguirla estaremos conectados y podremos elegir un nombre de usuario.
Tras elegir un nombre de usuario no único, nos escontraremos con un chat general con los jugadores que se encuentran en el menu y una ventana con los jugadores que se encuentran jugando alguna partida. Si pulsamos el botón de Start pasaremos a la siguiente sala.
La siguiente sala es el **Lobby**, aqui podremos pulsar el botón de matchmaking para encontrar una partida, si esque existe, para jugar directamente en ella, navegar por las diferentes salas decidiendo en cual entrar o crear una nosotros mismos. También podremos volver al menú anterior y observar una tabla de puntuaciones más altas de los jugadores.
Si decidimos crear una **Sala**, una nueva ventana aparecerá. Aquí podemos elegir el nombre de la sala y el modo de juego de la misma para después crearla, dentro de la sala tendremos la información de jugadores conectados, del nombre de la sala y del modo de juego que tiene la sala, también habrá un chat en el que podrán hablar los jugadores de la sala. El jugador que la creó es el que decide cuando empieza la partida.
Al terminar podremos volver a la **Sala** o salir de la misma volviendo al **Lobby**.