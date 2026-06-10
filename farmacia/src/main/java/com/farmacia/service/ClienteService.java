package com.farmacia.service;

import com.farmacia.exception.ResourceNotFoundException;
import com.farmacia.model.Cliente;
import com.farmacia.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: " + id));
    }

    public Cliente buscarPorCpf(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado com CPF: " + cpf));
    }

    public List<Cliente> buscarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    @Transactional
    public Cliente criar(Cliente cliente) {
        if (repository.existsByCpf(cliente.getCpf())) {
            throw new IllegalArgumentException("CPF ja cadastrado: " + cliente.getCpf());
        }
        return repository.save(cliente);
    }

    @Transactional
    public Cliente atualizar(Long id, Cliente dados) {
        Cliente existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setEmail(dados.getEmail());
        existente.setTelefone(dados.getTelefone());
        existente.setEndereco(dados.getEndereco());
        existente.setDataNascimento(dados.getDataNascimento());
        return repository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
