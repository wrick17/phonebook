'use strict';

var allDigitsRex = /^\d+$/,
    phoneRex = /^(\d{2})(\d{10})$/;

function Storage () {
}

Storage.prototype.initialize = function () {
  if (!Modernizr.localstorage)
    throw new Error('No localStorage Support in this browser');

  if (!localStorage.contacts)
    localStorage.setItem('contacts', JSON.stringify({}));

  this._contacts = JSON.parse(localStorage.getItem('contacts'));
};

Storage.prototype.getContacts = function () {
  return this._contacts;
};

Storage.prototype.saveContact = function (contactToSave) {
  if (!contactToSave.id)
    contactToSave.id = (new Date()).getTime();

  this._contacts[contactToSave.id] = contactToSave;

  localStorage.setItem("contacts", JSON.stringify(this._contacts));
};

Storage.prototype.deleteContact = function (contactToDelete) {
  if (!contactToDelete.id) return;

  delete this._contacts[contactToDelete.id];

  localStorage.setItem("contacts", JSON.stringify(this._contacts));
};

function isUpperCase(letter) {
  return 'A' <= letter && letter >= 'Z';
}

function capitalize (word) {
  if (isUpperCase(word.charAt(0)))
    return word;
  return word.charAt(0).toUpperCase() + word.substring(1);
}

// inspired from - http://brandontilley.com/2014/09/24/custom-react-components-and-the-valuelink-property.html
var PropLinkSupportMixin = {

  getPropLink: function (propName) {
    return this.props[propName + 'Link'] || {
      value: this.props[propName],
      requestChange: this.props['on' + capitalize(propName) + 'Change']
    };
  }

};

var PhoneNumberInput = React.createClass({
  mixins: [PropLinkSupportMixin],

  handleChange: function (e) {
    var tgt = e.target,
        phone = tgt.value;

    if (allDigitsRex.test(phone) && phone.length > 12 || phone.length > 14) return e.preventDefault();
    phone = allDigitsRex.test(phone) ? phone.replace(phoneRex, '+($1)-$2') : phone;

    this.getPropLink('value').requestChange(phone);
  },

  render: function () {
    return (<input type="text" name="contactPhone" value={this.getPropLink('value').value} onChange={this.handleChange}/>);
  }
});

var NewContactForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      name: '',
      phone: ''
    };
  },

  handleSave: function () {
    this.props.onSave(this.state);
    this.setState(this.getInitialState());
  },

  render: function () {
    return (
      <div>
        <label htmlFor="contactName">Name:</label>
        <input type="text" name="contactName" valueLink={this.linkState('name')}/>
        <label htmlFor="contactPhone">Phone:</label>
        <PhoneNumberInput valueLink={this.linkState('phone')}/>
        <button type="button" onClick={this.handleSave}>Save</button>
      </div>
    );
  }

});

var ContactListItem = React.createClass({

  triggerDelete: function () {
    return this.props.onDelete && this.props.onDelete(this.props.contact);
  },

  render: function () {
    var contact = this.props.contact;

    return (
      <li>{contact.name} - {contact.phone} <button type="button" onClick={this.triggerDelete}>Delete</button></li>
    );
  }

});

var ContactList = React.createClass({

  triggerContactDelete: function (contactToDelete) {
    return this.props.onContactDelete && this.props.onContactDelete(contactToDelete);
  },

  render: function () {
    var contacts = this.props.contacts,
        contactItems = Object.keys(contacts).map(function (k) {
          var contact = contacts[k];
          return (<ContactListItem contact={contact} key={contact.id} onDelete={this.triggerContactDelete}/>);
        }.bind(this));

    return (
      <ul>
        {contactItems}
      </ul>
    );
  }

});

var PhoneBook = React.createClass({

  getInitialState: function () {
    return {
      contacts: this.props.storage.getContacts()
    }
  },

  saveNewContact: function (contact) {
    this.props.storage.saveContact(contact);
    this.setState(this.getInitialState());
  },

  deleteContact: function (contactToDelete) {
    this.props.storage.deleteContact(contactToDelete);
    this.setState(this.getInitialState());
  },

  render: function () {
    return (
      <div>
        <NewContactForm onSave={this.saveNewContact}/>
        <ContactList contacts={this.state.contacts} onContactDelete={this.deleteContact}/>
      </div>
    );
  }

});

domready(function () {
  var storage = new Storage();

  try {
    storage.initialize();
  } catch (e) {
    return alert('ERROR: ' + e.message);
  }

  React.render(<PhoneBook storage={storage}/>,
               document.getElementById('content'));

  console.log('We\'re in business!');
});

