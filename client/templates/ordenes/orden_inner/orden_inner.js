/*****************************************************************************/
/* OrdenInner: Event Handlers */
/*****************************************************************************/
Meteor.subscribe('users');
Meteor.subscribe('star_products');
Meteor.subscribe('rutas');

Template.ProductoAgregar.events({
	'click .add': function(event, template)
	  	{
          var productId = this._id;
          var Descripcion = Inventario.findOne(productId).Descripcion;
          var Linea = Inventario.findOne(productId).Linea;
          var Etiqueta = Inventario.findOne(productId).Etiqueta;
          var PrecioUnitario = Inventario.findOne(productId).PrecioUnitario;
          //var descripcion = Inventario.find({productId).Descripcion;
	      	var ordenId = Router.current().params._id; //le pone al objeto de inventario el id de la orden actual para hacer join
          var info = {"ordenId": ordenId,
                      "ownerId": Meteor.user()._id,
                      "clientId": "clientid", //aún no se pone porque no e agregado clientes a la orden
                      "Descripcion": Descripcion,
                      "Linea": Linea,
                      "Cantidad": 1,
                      "PrecioUnitario": PrecioUnitario,
                      "Etiqueta": Etiqueta,
                      "ValorDelPedido":  PrecioUnitario
                    };
				  InvoiceItems.insert(info);
          console.log(info);
	  	},
      'click .star': function(event, template)
      {
          var productId = this._id;
          StarProducts.insert( { productId: productId, userId: Meteor.user()._id}
            , function( error, result) { 
              if ( error ) console.log ( error ); //info about what went wrong
              else console.log ( result ); //the _id of new object if successful
            }
          );
          //InvoiceItems.update(Router.current().params._id, {
          //  $set: { cliente: id}
          //});
      }
});

/*****************************************************************************/
/* ListaProductos: Helpers */
/*****************************************************************************/
Template.ListaProductos.helpers({
  checked: function() {
    var products = StarProducts.find({userId:Meteor.user()._id}).map(function (doc) {
      return doc.productId;
    });
    return Inventario.find({_id: { $in: products }})
  }
});
Template.OrdenInvoiceItems.helpers({
  inventarioEnOrden: function() {
      return InvoiceItems.find({ordenId: this._id});
  }
}); 

Template.OrdenHeader.events({
   'change select#cliente': function(event) 
    {
      event.preventDefault();
      var id = $('[name=ClienteAsignado]').val();
      Ordenes.update(Router.current().params._id, {
        $set: { cliente: id}
      });
    },
    'change select#ruta': function(event) 
    {
      event.preventDefault();
      var id = $('[name=RutaAsignada]').val();
      Ordenes.update(Router.current().params._id, {
        $set: { ruta: id}
      });
    }
});

Template.OrdenHeader.helpers({
  listaClientesOrden: function () {
      return Meteor.users.find({});
   },
   listaClientesSelected: function()
   {
      var orden = Ordenes.findOne({_id: Router.current().params._id});
      var users = Meteor.users.findOne({_id: orden.cliente});
      console.log(users._id);
      return users;
   },
   listaRutas: function () {
      return Rutas.find({});
   },
   rutaSelected: function()
   {
      var orden = Ordenes.findOne({_id: Router.current().params._id});
      var rutas = Rutas.findOne({_id: orden.ruta});
      console.log(rutas._id);
      return rutas;
   }
});

Template.TablaInvoiceItem.events({
  'click .borrar-item': function(event, template) {
    var borrar = confirm("¿Seguro que quieres borrar este item del recibo?");
    if (borrar){
      InvoiceItems.remove({_id: this._id});
    }
    else{
      console.log("no borra el item");
    }
  }
});

Template.TablaInvoiceItem.helpers({
  ValorPedido: function() {
    var Cantidad = InvoiceItems.findOne(this._id).Cantidad;
    var PrecioUnitario = InvoiceItems.findOne(this._id).PrecioUnitario;
    var ValorPedido = Cantidad * PrecioUnitario;
    var info = {"ValorDelPedido": ValorPedido};
    InvoiceItems.update({_id: this._id}, {$set: info});
    return InvoiceItems.findOne(this._id).ValorDelPedido;
  }
});

Template.OrdenTotal.helpers({
  //subtotal: function() {
  //  return InvoiceItems.find({}).ValorDelPedido;
  //}
  priceSum: function(){
      // fetch every items belonging to the currently displayed user
      var userItems = InvoiceItems.find({
        "ownerId": Meteor.user()._id
      }).fetch();
      // extract the price property in an array
      var userItemsPrices = _.pluck(userItems, "ValorDelPedido");
      // compute the sum using a simple array reduction
      return _.reduce(userItemsPrices, function(sum, price){
        return sum + parseFloat(price);
      }, 0);
      //var ordenId = Router.current().params._id; //le pone al objeto de inventario el id de la orden actual para hacer join
      //var info = {"Subtotal": precio};
  },
  iva: function(){
      // fetch every items belonging to the currently displayed user
      var userItems = InvoiceItems.find({
        "ownerId": Meteor.user()._id
      }).fetch();
      // extract the price property in an array
      var userItemsPrices = _.pluck(userItems, "ValorDelPedido");
      // compute the sum using a simple array reduction
      return _.reduce(userItemsPrices, function(sum, price){
        return sum + parseFloat(price) * .16;
      }, 0);
  },
  total: function(){
      // fetch every items belonging to the currently displayed user
      var userItems = InvoiceItems.find({
        "ownerId": Meteor.user()._id
      }).fetch();
      // extract the price property in an array
      var userItemsPrices = _.pluck(userItems, "ValorDelPedido");
      // compute the sum using a simple array reduction
      return _.reduce(userItemsPrices, function(sum, price){
        return sum + Math.round(parseFloat(price*1.16));
      }, 0);
  },
});

var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['Descripcion'];
PackageSearch = new SearchSource('inventario', fields, options);

Template.ListaProductos.helpers({
  inventario: function() {
    //if (Session.get("searchValue")) {
      return Inventario.find({});
    //} else {
    //  return Reportes.find({});
    //}
  },
  getPackages: function() {
    return PackageSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "$&")
      },
      sort: {isoScore: -1}
    });
  },
  isLoading: function() {
    return PackageSearch.getStatus().loading;
  }
});

Template.ListaProductos.events({
  "keyup #buscarProducto": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    console.log(text);
    PackageSearch.search(text);
  }, 200)
});

Template.OrdenContenido.events({
  'click .printpage': function(event, template)
      {
          window.print();
      }
});

/*****************************************************************************/
/* OrdenInner: Lifecycle Hooks */
/*****************************************************************************/
Template.OrdenInner.onCreated(function () {
});

Template.TablaInvoiceItem.onRendered(function () {
	//Meteor.subscribe("inventario");
  //Meteor.subscribe("ordenes");
  //Meteor.subscribe("ordencontenido");
});

Template.OrdenInner.onDestroyed(function () {
});
