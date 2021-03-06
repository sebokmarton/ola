#!/usr/bin/python
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
#
# MACAddressTest.py
# Copyright (C) 2013 Peter Newman

"""Test cases for the MACAddress class."""

__author__ = 'nomis52@gmail.com (Simon Newton)'

import unittest
from ola.MACAddress import MACAddress

class MACAddressTest(unittest.TestCase):

  def testBasic(self):
    mac = MACAddress(bytearray([0x01, 0x23, 0x45, 0x67, 0x89, 0xab]))
    self.assertEquals(b'\x01\x23\x45\x67\x89\xab', bytes(mac.mac_address))
    self.assertEquals('01:23:45:67:89:ab', str(mac))

    self.assertTrue(mac > None)
    mac2 = MACAddress(bytearray([0x01, 0x23, 0x45, 0x67, 0x89, 0xcd]))
    self.assertTrue(mac2 > mac)
    mac3 = MACAddress(bytearray([0x01, 0x23, 0x45, 0x67, 0x88, 0xab]))
    self.assertTrue(mac > mac3)
    macs = [mac, mac2, mac3]
    self.assertEquals([mac3, mac, mac2], sorted(macs))

  def testFromString(self):
    self.assertEquals(None, MACAddress.FromString(''))
    self.assertEquals(None, MACAddress.FromString('abc'))
    self.assertEquals(None, MACAddress.FromString(':'))
    self.assertEquals(None, MACAddress.FromString('0:1:2'))
    self.assertEquals(None, MACAddress.FromString('12345:1234'))

    mac = MACAddress.FromString('01:23:45:67:89:ab')
    self.assertTrue(mac)
    self.assertEquals(b'\x01\x23\x45\x67\x89\xab', bytes(mac.mac_address))
    self.assertEquals('01:23:45:67:89:ab', str(mac))

    mac2 = MACAddress.FromString('98.76.54.fe.dc.ba')
    self.assertTrue(mac2)
    self.assertEquals(b'\x98\x76\x54\xfe\xdc\xba', bytes(mac2.mac_address))
    self.assertEquals('98:76:54:fe:dc:ba', str(mac2))

  def testSorting(self):
    m1 = MACAddress(bytearray([0x48, 0x45, 0xff, 0xff, 0xff, 0xfe]))
    m2 = MACAddress(bytearray([0x48, 0x45, 0x00, 0x00, 0x02, 0x2e]))
    m3 = MACAddress(bytearray([0x48, 0x44, 0x00, 0x00, 0x02, 0x2e]))
    m4 = MACAddress(bytearray([0x48, 0x46, 0x00, 0x00, 0x02, 0x2e]))
    macs = [m1, m2, m3, m4]
    macs.sort()
    self.assertEquals([m3, m2, m1, m4], macs)

if __name__ == '__main__':
  unittest.main()
