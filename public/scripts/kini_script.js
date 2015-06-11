// a text box to search,
// a list of contacts,
// a button to add contact,
// a button/link on each contact to edit it

// on edit page, have input fields for first name, last name, company,
// title, street address, locality, city, pincode, state, country, landline, mobile, work email, personal email, skypeid
// a button to save, cancel
// cancel takes u to list page

var allDigitsRex = /^\d+$/,
    phoneRex = /^(\d{2})(\d{10})$/;

var SearchBox = React.createClass({
  render: function () {
    return (
      <div className="search-box">
        <input type="text" />
      </div>
    );
  }
});

var Contact = React.createClass({
  render: function () {
    return (
      <li className="contact">
        <span className="contant-name">{this.props.name}</span><span>: </span>
        <span className="contant-number">{this.props.phone}</span>
      </li>
    );
  }
});

var ContactsList = React.createClass({
  render: function () {
    var contactNodes = this.props.data.map(function (contact) {
      return (
        <Contact name={contact.name} phone={contact.phone} key={(contact.name + contact.phone)}/>
      );
    });
    return (
      <ul className="contact-list">
        {contactNodes}
      </ul>
    )
  }
});

var PhoneNumberInput = React.createClass({

  handleChange: function (e) {
    var tgt = e.target,
        phone = tgt.value;

    if (allDigitsRex.test(phone) && phone.length > 12 || phone.length > 14) return e.preventDefault();
    phone = allDigitsRex.test(phone) ? phone.replace(phoneRex, '+($1)-$2') : phone;

    this.props.onChange({value: phone});
  },

  render: function () {
    var phone = this.props.phone;

    return (
      <input type="text" placeholder="+91-9876543210" className="phone" onChange={this.handleChange} value={this.props.value}/>
    );
  }
});

var NewContact = React.createClass({

  getInitialState: function () {
    return ({
      contact: {
        name: '',
        phone: ''
      }
    });
  },

  handleContactSave: function (e) {
    this.props.onSave(this.state.contact);
    this.setState(this.getInitialState());  // clears the text boxes. got it.
  },

  nameChanged: function (e) {
    this.setState({
      contact: {
        name: e.target.value,
        phone: this.state.contact.phone
      }
    });
  },

  phoneChanged: function (e) {
    this.setState({
      contact: {
        name: this.state.contact.name,
        phone: e.value
      }
    }); // try
  },

  render: function () {
    var name = this.state.contact.name,
        phone = this.state.contact.phone;

    return (
      <div>
        <input type="text" placeholder="Name" value={name} onChange={this.nameChanged} />
        <PhoneNumberInput value={phone} onChange={this.phoneChanged}/>
        <button type="submit" className="new-contact" onClick={this.handleContactSave}>Add Contact</button>
      </div>
    );
  }
});

var PhoneBook = React.createClass({
  fetchContacts: function () {
    var that = this;
    superagent
      .get(this.props.url)
      .end(function (err, res) {
        that.setState({data: res.body});
      });
  },
  handleContactSubmit: function (contact) {
    var that = this;
    superagent
      .post(this.props.url)
      .send(contact)
      .end(function (err, res) {
        that.setState({data: res.body});
      });
  },
  getInitialState: function () {
    return {data: []};
  },
  componentDidMount: function () {
    this.fetchContacts();
  },
  render: function() {
    return (
      <div className="phone-book">
        <h2>Your Phone Book</h2>
        <SearchBox />
        <h4>Contact List</h4>
        <ContactsList data={this.state.data}/>
        <NewContact onSave={this.handleContactSubmit} />
      </div>
    );
  }
});

React.render(
  <PhoneBook url="phonebook.json"/>,
  document.getElementById('content')
);

// hello