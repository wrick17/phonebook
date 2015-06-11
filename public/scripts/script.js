// a text box to search,
// a list of contacts,
// a button to add contact,
// a button/link on each contact to edit it

// on edit page, have input fields for first name, last name, company,
// title, street address, locality, city, pincode, state, country, landline, mobile, work email, personal email, skypeid
// a button to save, cancel
// cancel takes u to list page



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
        <Contact name={contact.name} phone={contact.phone} />
      );
    });
    return (
      <ul className="contact-list">
        {contactNodes}
      </ul>
    )
  }
});

var NewContact = React.createClass({
  handleSubmit: function (e) {
    e.preventDefault();
    var name = React.findDOMNode(this.refs.name).value.trim();
    var phone = React.findDOMNode(this.refs.phone).value.trim();
    this.props.onContactSubmit({name: name, phone: phone});
    React.findDOMNode(this.refs.name).value = '';
    React.findDOMNode(this.refs.phone).value = '';
    React.findDOMNode(this.refs.phone).blur();
  },
  handleKeyUp: function (e) {
    var phone = React.findDOMNode(this.refs.phone).value;
    if(phone.match(/\+[0-9]{12}/) !== null && phone.match(/\+[0-9]{12}/)[0].length === 13){
      phone = phone.replace(new RegExp('(^.{0,3})', 'i'), '$&-');
      React.findDOMNode(this.refs.phone).value = phone;
    }
  },
  render: function () {
    return (
      <form className="new-contact-form" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Name" ref="name" required />
        <input type="text" placeholder="+91-9876543210" ref="phone" className="phone" onKeyUp={this.handleKeyUp} pattern="\+(?:[0-9]{2})-(?:[0-9]{10})" required/>
        <button type="submit" className="new-contact">Add Contact</button>
      </form>
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
        <NewContact onContactSubmit={this.handleContactSubmit} />
      </div>
    );
  }
});

React.render(
  <PhoneBook url="phonebook.json"/>,
  document.getElementById('content')
);
