import React from 'react';
import '../../assets/css/footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2>LocalServicePro</h2>
          <p>Enhancing your community with reliable and professional services.</p>
          <div className="newsletter">
            <h3>Stay Updated</h3>
            <form>
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/book-service">Book a Service</a></li>
              <li><a href="/manage-booking">Manage Booking</a></li>
              <li><a href="/service-status">Service Status</a></li>
              <li><a href="/service-areas">Service Areas</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h3>Company</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/testimonials">Testimonials</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h3>Support</h3>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/payments">Payment Options</a></li>
              <li><a href="/faq">FAQs</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h3>Legal</h3>
            <ul>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
              <li><a href="/guarantee">Service Guarantee</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        © {new Date().getFullYear()} LocalServicePro. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;