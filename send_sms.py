#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Voice SMS Sender for StoneRiver Junk Removal

Requirements:
pip install googlevoice

Usage:
python send_sms.py "6126854696" "Your message here" "jameshewitt312@gmail.com" "your_app_password"
"""

import sys
import json
import io

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from googlevoice import Voice

def send_sms(to_number, message_text, email, password):
    try:
        print(f"Sending SMS to: {to_number}")
        print(f"Message: {message_text}")
        print(f"From: {email}")
        
        # Initialize Google Voice
        voice = Voice()
        
        # Login to Google Voice
        print("Logging into Google Voice...")
        voice.login(email=email, passwd=password)
        
        # Send SMS
        print("Sending SMS...")
        result = voice.send_sms(to_number, message_text)
        
        print("SMS sent successfully!")
        return {
            'success': True,
            'message': 'SMS sent successfully',
            'to': to_number,
            'from': email,
            'timestamp': str(result.get('timestamp', '')) if result else ''
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to send SMS'
        }

if __name__ == '__main__':
    # Get arguments from command line
    if len(sys.argv) != 5:
        print("Usage: python send_sms.py <phone> <message> <email> <password>")
        print("Example: python send_sms.py \"6126854696\" \"Your message\" \"jameshewitt312@gmail.com\" \"your_password\"")
        sys.exit(1)
    
    to_number = sys.argv[1]
    message_text = sys.argv[2]
    email = sys.argv[3]
    password = sys.argv[4]
    
    # Send SMS
    result = send_sms(to_number, message_text, email, password)
    
    # Output result as JSON
    print(json.dumps(result, indent=2))
