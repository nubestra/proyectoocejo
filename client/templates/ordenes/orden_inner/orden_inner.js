/*****************************************************************************/
/* OrdenInner: Event Handlers */
/*****************************************************************************/
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
	  	}
});

/*****************************************************************************/
/* ListaProductos: Helpers */
/*****************************************************************************/
//Template.ProductoAgregar.helpers({
//	checked: function() {
//		if Inventario.find({this._id, noorden: null}) {
//			return "Checked";
//		}
//	}
//});
Template.OrdenInvoiceItems.helpers({
  inventarioEnOrden: function() {
      return InvoiceItems.find({ordenId: this._id});
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
  subtotal: function() {
    return InvoiceItems.find().ValorDelPedido;
  }
});

Template.ListaProductos.helpers({
  inventario: function() {
    //if (Session.get("searchValue")) {
      return Inventario.find({});
    //} else {
    //  return Reportes.find({});
    //}
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
