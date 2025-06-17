import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

const RejectModal = ({ visible, onClose, onReject, rejectNote, setRejectNote }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Nhập lý do từ chối</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 60, marginBottom: 16 }}
            placeholder="Nhập lý do..."
            value={rejectNote}
            onChangeText={setRejectNote}
            multiline
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: '#888', fontSize: 16 }}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onReject} disabled={!rejectNote.trim()}>
              <Text style={{ color: '#FF4757', fontWeight: 'bold', fontSize: 16, opacity: rejectNote.trim() ? 1 : 0.5 }}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RejectModal; 